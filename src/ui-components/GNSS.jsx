/* eslint-disable */
import { useState, useEffect } from "react";
import { getOverrideProps } from "./utils";
import { Button, Flex, Text, TextField } from "@aws-amplify/ui-react";
import { fetchRtcm, startGeo, startProc, stopProc } from "../utils/helper";
import LongToaster from './LongToaster';
import { downloadData, list, uploadData } from 'aws-amplify/storage';
import fileDownload from 'js-file-download';
import toast from 'react-hot-toast';
import './style.css';

export default function GNSS(props) {
  const { overrides, ...rest } = props;

  const [rtcmList, setRtcmList] = useState([]);
  const [rnxList, setRnxList] = useState([]);
  const [hdfList, setHdfList] = useState([]);
  const [bnxList, setBnxList] = useState([]);
  const [geoList, setGeoList] = useState([]);
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [altitude, setAltitude] = useState(0.0);
  const [startYear, setStartYear] = useState(2024);
  const [startMonth, setStartMonth] = useState(1);
  const [startDay, setStartDay] = useState(9);
  const [startHour, setStartHour] = useState(3);
  const [startMinute, setStartMinute] = useState(22);
  const [endYear, setEndYear] = useState(2024);
  const [endMonth, setEndMonth] = useState(1);
  const [endDay, setEndDay] = useState(9);
  const [endHour, setEndHour] = useState(3);
  const [endMinute, setEndMinute] = useState(22);


  useEffect(() => {
    fetchFileList();

    const id1 = setInterval(() => {
      fetchFileList();
    }, 30 * 1000);

    // Geo interval
    const id2 = setInterval(() => {
      fetchGeoList();
    }, 1000);

    return () => {
      clearInterval(id1);
      clearInterval(id2);
    }
  }, []);

  const fetchFileList = async () => {
    try {
      let result = await list({
        prefix: 'rtcm/',
      });
      let fileList = result.items.map(item => item.key.split('/')[1]).slice().sort().reverse();
      setRtcmList(fileList);//.slice(0, 200));

      result = await list({
        prefix: 'rinex/',
      });
      fileList = result.items.map(item => item.key.split('/')[1]).slice().sort().reverse();
      setRnxList(fileList.slice(0, 200));

      // result = await list({
      //   prefix: 'binex/',
      // });
      // fileList = result.items.map(item => item.key.split('/')[1]).slice().sort().reverse();
      // setBnxList(fileList.slice(0, 200));

      result = await list({
        prefix: 'hdf5/',
      });
      fileList = result.items.map(item => item.key.split('/')[1]).slice().sort().reverse();
      setHdfList(fileList.slice(0, 200));
    } catch (error) {
      console.log(error);
    }
  }

  const fetchGeoList = async () => {
    try {
      let result = await list({
        prefix: 'geo/',
      });
      let fileList = result.items.map(item => item.key.split('/')[1]).slice().sort().reverse();
      setGeoList(fileList.slice(0, 200));      
    } catch (error) {
      console.log(error);
    }
  }

  const onFetch = () => {
    //fetchRtcm();
    startGeo(
      { latitude, longitude, altitude },
      { startYear, startMonth, startDay, startHour, startMinute },
      { endYear, endMonth, endDay, endHour, endMinute }
    )
  }

  const onStart = () => {
    startProc();
  }

  const onStop = () => {
    stopProc();
  }

  const downloadFile = async(type, file) => {
    try {
      const result = await downloadData( { key: `${type}/${file}` }).result;
      const blob = await result.body.blob();
      fileDownload(blob, file);
    } catch (error) {
      toast.error('Failed to download file.');
    }
  }

  return (
    <>
    <LongToaster />
    <Flex
      gap="20px"
      direction="column"
      width="unset"
      height="unset"
      justifyContent="flex-start"
      alignItems="center"
      overflow="hidden"
      position="relative"
      padding="50px 150px 150px 150px"
      backgroundColor="rgba(255,255,255,1)"
      {...getOverrideProps(overrides, "GNSS")}
      {...rest}
    >
      <Flex
        gap="20px"
        direction="row"
        width="unset"
        height="60px"
        justifyContent="left"
        alignItems="flex-end"
        overflow="hidden"
        shrink="0"
        position="relative"
        padding="5px 5px 5px 5px"
        {...getOverrideProps(overrides, "Location")}
      >
        <Text
          fontFamily="Inter"
          fontSize="14px"
          fontWeight="400"
          color="rgba(0,0,0,1)"
          lineHeight="21px"
          textAlign="center"
          display="block"
          direction="column"
          justifyContent="unset"
          width="113px"
          height="37px"
          gap="unset"
          alignItems="unset"
          shrink="0"
          position="relative"
          padding="8px 0px 0px 0px"
          whiteSpace="pre-wrap"
          children="User Location"
          {...getOverrideProps(overrides, "User Location")}
        ></Text>
        <TextField
          onChange={(e) => setLatitude(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Latitude"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="40.7128"
          {...getOverrideProps(overrides, "Latitude")}
        ></TextField>
        <TextField
          onChange={(e) => setLongitude(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Longitude"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="-74.0060"
          {...getOverrideProps(overrides, "Longitude")}
        ></TextField>
        <TextField
          onChange={(e) => setAltitude(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Altitude"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="0"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>
      </Flex>
      <Flex
        gap="20px"
        direction="row"
        width="unset"
        height="80px"
        justifyContent="center"
        alignItems="flex-end"
        overflow="hidden"
        shrink="0"
        position="relative"
        padding="5px 5px 5px 5px"
        {...getOverrideProps(overrides, "Location")}
      >
        <Text
          fontFamily="Inter"
          fontSize="14px"
          fontWeight="400"
          color="rgba(0,0,0,1)"
          lineHeight="21px"
          textAlign="center"
          display="block"
          direction="column"
          justifyContent="unset"
          width="113px"
          height="37px"
          gap="unset"
          alignItems="unset"
          shrink="0"
          position="relative"
          padding="8px 0px 0px 0px"
          whiteSpace="pre-wrap"
          children="Start: "
          {...getOverrideProps(overrides, "User Location")}
        ></Text>
        <TextField
          onChange={(e) => setStartYear(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Year"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="2024"
          {...getOverrideProps(overrides, "Latitude")}
        ></TextField>
        <TextField
          onChange={(e) => setStartMonth(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Month"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="1"
          {...getOverrideProps(overrides, "Longitude")}
        ></TextField>
        <TextField
          onChange={(e) => setStartDay(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Day"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="9"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>
        <TextField
          onChange={(e) => setStartHour(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Hour"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="3"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>        
        <TextField
          onChange={(e) => setStartMinute(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Minute"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="22"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>        
      </Flex>
      <Flex
        gap="20px"
        direction="row"
        width="unset"
        height="80px"
        justifyContent="center"
        alignItems="flex-end"
        overflow="hidden"
        shrink="0"
        position="relative"
        padding="5px 5px 5px 5px"
        {...getOverrideProps(overrides, "Location")}
      >
        <Text
          fontFamily="Inter"
          fontSize="14px"
          fontWeight="400"
          color="rgba(0,0,0,1)"
          lineHeight="21px"
          textAlign="center"
          display="block"
          direction="column"
          justifyContent="unset"
          width="113px"
          height="37px"
          gap="unset"
          alignItems="unset"
          shrink="0"
          position="relative"
          padding="8px 0px 0px 0px"
          whiteSpace="pre-wrap"
          children="End: "
          {...getOverrideProps(overrides, "User Location")}
        ></Text>
        <TextField
          onChange={(e) => setEndYear(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Year"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="2024"
          {...getOverrideProps(overrides, "Latitude")}
        ></TextField>
        <TextField
          onChange={(e) => setEndMonth(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Month"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="1"
          {...getOverrideProps(overrides, "Longitude")}
        ></TextField>
        <TextField
          onChange={(e) => setEndDay(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Day"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="9"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>
        <TextField
          onChange={(e) => setEndHour(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Hour"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="3"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>        
        <TextField
          onChange={(e) => setEndMinute(e.currentTarget.value)}
          width="100px"
          height="unset"
          label="Minute"
          shrink="0"
          placeholder=""
          size="small"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          defaultValue="22"
          {...getOverrideProps(overrides, "Altitude")}
        ></TextField>        
      </Flex>      
      <Flex
        gap="30px"
        direction="row"
        width="unset"
        height="unset"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
        shrink="0"
        position="relative"
        padding="20px 20px 20px 20px"
        {...getOverrideProps(overrides, "Buttons")}
      >
        <Button
          onClick={onFetch}
          width="170px"
          height="unset"
          shrink="0"
          size="large"
          isDisabled={false}
          variation="primary"
          children="GeoFencing"
          {...getOverrideProps(overrides, "Fetch")}
        ></Button>
        <Button
          onClick={onStart}
          width="170px"
          height="unset"
          shrink="0"
          size="large"
          isDisabled={false}
          variation="primary"
          children="Start"
          {...getOverrideProps(overrides, "Start")}
        ></Button>
        <Button
          onClick={onStop}
          width="170px"
          height="unset"
          shrink="0"
          size="large"
          isDisabled={false}
          variation="primary"
          children="Stop"
          {...getOverrideProps(overrides, "Stop")}
        ></Button>
      </Flex>
      <Flex
        gap="20px"
        direction="row"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="flex-start"
        overflow="hidden"
        shrink="0"
        position="relative"
        padding="0px 0px 0px 0px"
        {...getOverrideProps(overrides, "S3")}
      >
        <Flex
          gap="10px"
          direction="column"
          width="unset"
          height="unset"
          justifyContent="flex-start"
          alignItems="flex-start"
          shrink="0"
          position="relative"
          padding="13px 0px 13px 0px"
          backgroundColor="rgba(255,255,255,1)"
          {...getOverrideProps(overrides, "RTCM4211741")}
        >
          <Text
            fontFamily="Inter"
            fontSize="20px"
            fontWeight="400"
            color="rgba(48,64,80,1)"
            lineHeight="30px"
            textAlign="center"
            display="block"
            direction="column"
            justifyContent="unset"
            width="350px"
            height="unset"
            gap="unset"
            alignItems="unset"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children="RTCM"
            {...getOverrideProps(overrides, "RTCM4211740")}
          ></Text>
          <Flex
            gap="0"
            direction="column"
            width="350px"
            height="unset"
            justifyContent="flex-start"
            alignItems="flex-start"
            overflow="hidden"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            {...getOverrideProps(overrides, "UserTable4211095")}
          >
            { rtcmList.map(file => (
              <Flex key={file}
                gap="0"
                direction="row"
                width="unset"
                height="40px"
                justifyContent="center"
                alignItems="center"
                shrink="0"
                alignSelf="stretch"
                position="relative"
                padding="16px 0px 16px 0px"
                backgroundColor="rgba(255,255,255,1)"
                {...getOverrideProps(overrides, "DataRow4211096")}
              >
                <Text
                  onClick={() => { downloadFile('rtcm', file) }}
                  className="link-style"
                  fontFamily="Inter"
                  fontSize="14px"
                  fontWeight="400"
                  color="rgba(64,106,191,1)"
                  lineHeight="21px"
                  textAlign="left"
                  display="block"
                  direction="column"
                  justifyContent="unset"
                  width="unset"
                  height="unset"
                  gap="unset"
                  alignItems="unset"
                  shrink="0"
                  position="relative"
                  padding="0px 0px 0px 0px"
                  whiteSpace="pre-wrap"
                  children={file}
                  {...getOverrideProps(overrides, "s34211098")}
                ></Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex
          gap="10px"
          direction="column"
          width="unset"
          height="unset"
          justifyContent="flex-start"
          alignItems="flex-start"
          shrink="0"
          position="relative"
          padding="13px 0px 13px 0px"
          backgroundColor="rgba(255,255,255,1)"
          {...getOverrideProps(overrides, "RTCM4211790")}
        >
          <Text
            fontFamily="Inter"
            fontSize="20px"
            fontWeight="400"
            color="rgba(48,64,80,1)"
            lineHeight="30px"
            textAlign="center"
            display="block"
            direction="column"
            justifyContent="unset"
            width="300px"
            height="unset"
            gap="unset"
            alignItems="unset"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children="RINEX"
            {...getOverrideProps(overrides, "RINEX")}
          ></Text>
          <Flex
            gap="0"
            direction="column"
            width="350px"
            height="unset"
            justifyContent="flex-start"
            alignItems="flex-start"
            overflow="hidden"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            {...getOverrideProps(overrides, "UserTable4211792")}
          >
            { rnxList.map(file => (
            <Flex
              key={file}
              gap="0"
              direction="row"
              width="unset"
              height="40px"
              justifyContent="center"
              alignItems="center"
              shrink="0"
              alignSelf="stretch"
              position="relative"
              padding="16px 0px 16px 0px"
              backgroundColor="rgba(255,255,255,1)"
              {...getOverrideProps(overrides, "DataRow4211793")}
            >
              <Text
                onClick={() => { downloadFile('rinex', file) }}
                className="link-style"
                fontFamily="Inter"
                fontSize="14px"
                fontWeight="400"
                color="rgba(64,106,191,1)"
                lineHeight="21px"
                textAlign="left"
                display="block"
                direction="column"
                justifyContent="unset"
                width="unset"
                height="unset"
                gap="unset"
                alignItems="unset"
                shrink="0"
                position="relative"
                padding="0px 0px 0px 0px"
                whiteSpace="pre-wrap"
                children={file}
                {...getOverrideProps(overrides, "s34211794")}
              ></Text>
            </Flex>))}
          </Flex>
        </Flex>
        <Flex
          gap="10px"
          direction="column"
          width="unset"
          height="unset"
          justifyContent="flex-start"
          alignItems="flex-start"
          shrink="0"
          position="relative"
          padding="13px 0px 13px 0px"
          backgroundColor="rgba(255,255,255,1)"
          {...getOverrideProps(overrides, "RTCM4211790")}
        >
          <Text
            fontFamily="Inter"
            fontSize="20px"
            fontWeight="400"
            color="rgba(48,64,80,1)"
            lineHeight="30px"
            textAlign="center"
            display="block"
            direction="column"
            justifyContent="unset"
            width="300px"
            height="unset"
            gap="unset"
            alignItems="unset"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children="GEO"
            {...getOverrideProps(overrides, "BINEX")}
          ></Text>
          <Flex
            gap="0"
            direction="column"
            width="380px"
            height="unset"
            justifyContent="flex-start"
            alignItems="flex-start"
            overflow="hidden"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            {...getOverrideProps(overrides, "UserTable4211792")}
          >
            { geoList.map(file => (
            <Flex
              key={file}
              gap="0"
              direction="row"
              width="unset"
              height="40px"
              justifyContent="center"
              alignItems="center"
              shrink="0"
              alignSelf="stretch"
              position="relative"
              padding="16px 0px 16px 0px"
              backgroundColor="rgba(255,255,255,1)"
              {...getOverrideProps(overrides, "DataRow4211793")}
            >
              <Text
                onClick={() => { downloadFile('geo', file) }}
                className="link-style"
                fontFamily="Inter"
                fontSize="14px"
                fontWeight="400"
                color="rgba(64,106,191,1)"
                lineHeight="21px"
                textAlign="left"
                display="block"
                direction="column"
                justifyContent="unset"
                width="unset"
                height="unset"
                gap="unset"
                alignItems="unset"
                shrink="0"
                position="relative"
                padding="0px 0px 0px 0px"
                whiteSpace="pre-wrap"
                children={file}
                {...getOverrideProps(overrides, "s34211794")}
              ></Text>
            </Flex>))}
          </Flex>
        </Flex>
        <Flex
          gap="10px"
          direction="column"
          width="unset"
          height="unset"
          justifyContent="flex-start"
          alignItems="flex-start"
          shrink="0"
          position="relative"
          padding="13px 0px 13px 0px"
          backgroundColor="rgba(255,255,255,1)"
          {...getOverrideProps(overrides, "RTCM4211790")}
        >
          <Text
            fontFamily="Inter"
            fontSize="20px"
            fontWeight="400"
            color="rgba(48,64,80,1)"
            lineHeight="30px"
            textAlign="center"
            display="block"
            direction="column"
            justifyContent="unset"
            width="300px"
            height="unset"
            gap="unset"
            alignItems="unset"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children="HDF5"
            {...getOverrideProps(overrides, "HDF5")}
          ></Text>
          <Flex
            gap="0"
            direction="column"
            width="350px"
            height="unset"
            justifyContent="flex-start"
            alignItems="flex-start"
            overflow="hidden"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            {...getOverrideProps(overrides, "UserTable4211792")}
          >
            { hdfList.map(file => (
            <Flex
              key={file}
              gap="0"
              direction="row"
              width="unset"
              height="40px"
              justifyContent="center"
              alignItems="center"
              shrink="0"
              alignSelf="stretch"
              position="relative"
              padding="16px 0px 16px 0px"
              backgroundColor="rgba(255,255,255,1)"
              {...getOverrideProps(overrides, "DataRow4211793")}
            >
              <Text
                onClick={() => { downloadFile('hdf5', file) }}
                className="link-style"
                fontFamily="Inter"
                fontSize="14px"
                fontWeight="400"
                color="rgba(64,106,191,1)"
                lineHeight="21px"
                textAlign="left"
                display="block"
                direction="column"
                justifyContent="unset"
                width="unset"
                height="unset"
                gap="unset"
                alignItems="unset"
                shrink="0"
                position="relative"
                padding="0px 0px 0px 0px"
                whiteSpace="pre-wrap"
                children={file}
                {...getOverrideProps(overrides, "s34211794")}
              ></Text>
            </Flex>))}
          </Flex>
        </Flex>        
      </Flex>
    </Flex>
    </>
  );
}
