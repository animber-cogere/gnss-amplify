import json
import boto3

# Get a running task id
def get_running_task_id(cluster_name):
    # Create an ECS client
    ecs_client = boto3.client('ecs')

    # List running tasks in the specified cluster
    response = ecs_client.list_tasks(
        cluster=cluster_name,
        desiredStatus='RUNNING'
    )

    # Check if there are running tasks
    if 'taskArns' in response and response['taskArns']:
        # Get the task ID of the first running task (you may adjust this logic based on your requirements)
        running_task_id = response['taskArns'][0].split("/")[-1]
        return running_task_id
    else:
        return None

def startGeo(client, location, startDateTime, endDateTime):
  env_vars = [{
    'name': 'APP_MODE',
    'value': 'GEO'
  }, {
    'name': 'LATITUDE',
    'value': str(location['latitude'])
  }, {
    'name': 'LONGITUDE',
    'value': str(location['longitude'])
  }, {
    'name': 'ALTITUDE',
    'value': str(location['altitude'])
  }, {
    'name': 'START_YEAR',
    'value': str(startDateTime['startYear'])
  }, {
    'name': 'START_MONTH',
    'value': str(startDateTime['startMonth'])
  }, {
    'name': 'START_DAY',
    'value': str(startDateTime['startDay'])
  }, {
    'name': 'START_HOUR',
    'value': str(startDateTime['startHour'])
  }, {
    'name': 'START_MINUTE',
    'value': str(startDateTime['startMinute'])
  }, {
    'name': 'END_YEAR',
    'value': str(endDateTime['endYear'])
  }, {
    'name': 'END_MONTH',
    'value': str(endDateTime['endMonth'])
  }, {
    'name': 'END_DAY',
    'value': str(endDateTime['endDay'])
  }, {
    'name': 'END_HOUR',
    'value': str(endDateTime['endHour'])
  }, {
    'name': 'END_MINUTE',
    'value': str(endDateTime['endMinute'])
  }]

  # Run a task
  client.run_task(
    cluster='gnss-cluster', # name of the cluster
    launchType = 'FARGATE',
    taskDefinition='gnss-task:2', # replace with your task definition name and revision
    count = 1,
    platformVersion='LATEST',
    networkConfiguration={
      'awsvpcConfiguration': {
        'subnets': [
          'subnet-06d16394a03da4baf', # replace with your public subnet or a private with NAT
          'subnet-04f8d732ff35c34f2', # Second is optional, but good idea to have two
          'subnet-09152881270394b6c'
        ],
        'assignPublicIp': 'DISABLED'
      }
    },
    overrides={
      'containerOverrides': [{
        'name': 'gnss-container',
        'environment': env_vars
      }]
    }
  )
  return 'Started a task successfully.'  

def startTask(client, batch_amount):
  for batch_num in range(3):
    # Environment variables for fargate
    env_vars = [{
      'name': 'APP_MODE',
      'value': 'RECEIVER'
    }, {
      'name': 'BATCH_AMOUNT',
      'value': str(batch_amount)
    }, {
      'name': 'BATCH_NUM',
      'value': str(batch_num)
    }]

    # Run a task
    client.run_task(
      cluster='gnss-cluster', # name of the cluster
      launchType = 'FARGATE',
      taskDefinition='gnss-task:2', # replace with your task definition name and revision
      count = 1,
      platformVersion='LATEST',
      networkConfiguration={
        'awsvpcConfiguration': {
          'subnets': [
            'subnet-06d16394a03da4baf', # replace with your public subnet or a private with NAT
            'subnet-04f8d732ff35c34f2', # Second is optional, but good idea to have two
            'subnet-09152881270394b6c'
          ],
          'assignPublicIp': 'DISABLED'
        }
      },
      overrides={
        'containerOverrides': [{
          'name': 'gnss-container',
          'environment': env_vars
        }]
      }
    )
  return 'Started a task successfully.'

def stopTask(client):
  result = 'Stopped the task successfully.'
  for batch_num in range(3):
    # Stop a task
    task_id = get_running_task_id('gnss-cluster')
    if task_id:
      client.stop_task(
          cluster='gnss-cluster', # name of the cluster
          task=task_id, # task ID to stop
      )
    else:
      result = 'No running tasks found.'
      break
  return result

def handler(event, context):
  status = 200
  try:
    body = json.loads(event['body'])
  except json.JSONDecodeError as e:
    status = 400
    result = 'Invalid JSON in the request options'
  
  if status == 200:
    state = body.get('state')
    client = boto3.client('ecs')
    mode = body.get('mode')
    
    if state == 'start':
      # Start a task
      if mode == 'geo':
        result = startGeo(client, body.get('location'),
                           body.get('startDateTime'), body.get('endDateTime'))
      else:
        batch_amount = 500
        result = startTask(client, batch_amount)
    elif state == 'stop':
      # Stop the task
      result = stopTask(client)
    
  return {
    'statusCode': status,
    'headers': {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    'body': json.dumps({
      'result': result,
    })
  }
