import json

import asyncio
import logging
# import typing
# from signal import SIGINT, SIGTERM, signal
# from sys import exit

from ntrip.ntripstreams import NtripStream

# def procSigint(signum: int, frame: typing.types.FrameType) -> None:
#   print("Received SIGINT. Shutting down, Adjø!")
#   exit(3)

# def procSigterm(signum: int, frame: typing.types.FrameType) -> None:
#   print("Received SIGTERM. Shutting down, Adjø!")
#   exit(4)

# signal(SIGINT, procSigint)
# signal(SIGTERM, procSigterm)

async def procRtcmStream(
  url: str,
  mountPoint: str,
  user: str = None,
  passwd: str = None,
  fail: int = 0,
  retry: int = 5,
) -> None:
  """


  Parameters
  ----------
  url : str
    DESCRIPTION.
  mountPoint : str
    DESCRIPTION.
  user : str, optional
    DESCRIPTION. The default is None.
  passwd : str, optional
    DESCRIPTION. The default is None.
  fail : int, optional
    DESCRIPTION. The default is 0.
  retry : int, optional
    DESCRIPTION. The default is 5.

  Returns
  -------
  None
    DESCRIPTION.

  """
  # TODO
  ntripstream = NtripStream({
    'aws_access_key_id': 'ACCESS_KEY_ID',
    'aws_secret_access_key': 'SECRET_ACCESS_KEY+',
    'aws_region': 'us-east-1',
    'bucket_name': 'gnss-s3'
  })
  try:
    await ntripstream.requestNtripStream(url, mountPoint, user, passwd)
  except OSError as error:
    print(error)
    return

  # while True:
  try:
    rtcmFrame, timeStamp = await ntripstream.getRtcmFrame()
    await ntripstream.close()
    fail = 0
  except (ConnectionError, IOError):
    if fail >= retry:
      fail += 1
      sleepTime = 5 * fail
      if sleepTime > 300:
          sleepTime = 300
      print(
          f"{mountPoint}:{fail} failed attempt to reconnect. "
          f"Will retry in {sleepTime} seconds!"
      )
      await asyncio.sleep(sleepTime)
      await procRtcmStream(url, mountPoint, user, passwd, fail)
    else:
      fail += 1
      print(f"{mountPoint}:Reconnecting. Attempt no. {fail}.")
      await asyncio.sleep(2)
      await procRtcmStream(url, mountPoint, user, passwd, fail)

async def rtcmStreamTasks(url: str, mountPoints: str, user: str, passwd: str) -> None:
  """

  Parameters
  ----------
  url : str
    DESCRIPTION.
  mountPoints : str
    DESCRIPTION.
  user : str
    DESCRIPTION.
  passwd : str
    DESCRIPTION.

  Returns
    -------
    None
    DESCRIPTION.

  """
  tasks = {}
  for mountPoint in mountPoints:
    tasks[mountPoint] = asyncio.create_task(
      procRtcmStream(url, mountPoint, user, passwd)
    )
  for mountPoint in mountPoints:
    await tasks[mountPoint]

def handler(event, context):
  # try:
  #   sourceTable = asyncio.run(ntripstream.requestSourcetable(url))
  #   for source in sourceTable:
 	#     print(source)
  # except OSError as error:
  #   print(error)
  
  asyncio.run(rtcmStreamTasks('http://rtgpsout.earthscope.org:2101', ['AB07_RTCM3'], 'josborne', 'EaxYrrdc'))
  
  return {
    'statusCode': 200,
    'headers': {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    'body': json.dumps('Hello from your new Amplify Python lambda!')
  }

# handler('', '')