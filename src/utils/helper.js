import { post } from 'aws-amplify/api';
import toast from 'react-hot-toast';

export async function fetchRtcm() {
  try {
    const restOperation = post({
      apiName: 'gnssAPI',
      path: '/items',
      options: {},
    });
    const response = await restOperation.response;
    toast.success('Fetching data succeedeed.');
  } catch (err) {
    toast.error('Fetching data failed.');
  }
}

export async function startGeo(location, startDateTime, endDateTime) {
  try {
    const restOperation = post({
      apiName: 'gnssProc',
      path: '/proc',
      options: {
        body: {
          state: 'start',
          mode: 'geo',
          location,
          startDateTime,
          endDateTime
        }
      },
    });
    const { body } = await restOperation.response;
    const json = await body.json();
    toast.success(json['result']);
  } catch (err) {
    toast.error('Failed to start processing.');
  }
}

export async function startProc() {
  try {
    const restOperation = post({
      apiName: 'gnssProc',
      path: '/proc',
      options: {
        body: {
          state: 'start',
          mode: 'receiver'
        }
      },
    });
    const { body } = await restOperation.response;
    const json = await body.json();
    toast.success(json['result']);
  } catch (err) {
    toast.error('Failed to start processing.');
  }
}

export async function stopProc() {
  try {
    const restOperation = post({
      apiName: 'gnssProc',
      path: '/proc',
      options: {
        body: {
          state: 'stop',
        }
      },
    });
    const { body } = await restOperation.response;
    const json = await body.json();
    toast.success(json['result']);
  } catch (err) {
    toast.error('Failed to stop processing.');
  }
}
