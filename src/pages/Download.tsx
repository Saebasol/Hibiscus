// Reference: https://github.com/Saebasol/lily/blob/develop/src/App.jsx
import * as React from 'react';
import { useParams } from 'react-router';
import JSZip from 'jszip';
import { Progress, Flex, Heading, Text } from '@chakra-ui/react';
import { saveAs } from 'file-saver';
import api from '../api';
import type { heliotropeImageInfo, heliotropeImageList } from '../types';
import * as zip from '@zip.js/zip.js';
interface IFailedItem {
  url: string;
  filename: string;
}
function getProgress(now: number, total: number) {
  return (now / total) * 100;
}

const Download = () => {
  const { useState, useEffect } = React;
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(0);
  const [tries, setTries] = useState(0);
  const [isCompress, setIsCompress] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const { id } = useParams<{ id: string }>();

  async function mainFunc() {
    setStartTime(new Date().getTime());
    if (!id || Number.isNaN(id)) {
      alert('인자값이 주어지지 않았습니다!');
      return;
    }
    if (
      window.confirm(
        '브라우저의 한계로 많은 이미지는 다운로드 할수 없을수도 있습니다. 시도하시겠습니까?',
      )
    ) {
      const blobWriter = new zip.BlobWriter('application/zip');
      const writer = new zip.ZipWriter(blobWriter, { bufferedWrite: true });
      const imageInfoResponse = await fetch(api + `/hitomi/images/${id}`);
      if (imageInfoResponse.status == 404) {
        alert('찾을수 없습니다.');
        return;
      }
      const imagesInfo: heliotropeImageList = await imageInfoResponse.json();

      let count = 0;
      let tries = 0;
      let total = 0;

      let failedList: IFailedItem[] = [];

      function addFailed(url: string, filename: string) {
        failedList.push({ url, filename });
        setFailed(failedList.length);
      }
      async function getImage(url: string, filename: string) {
        let image;
        try {
          image = await fetch(url);
        } catch (e) {
          addFailed(url, filename);
        }
        if (image) {
          if (image.status != 200) {
            addFailed(url, filename);
          }
          const imgBlob = await image.blob();
          await writer.add(`${id}/${filename}`, new zip.BlobReader(imgBlob));
          count++;
          setProgress(getProgress(count, total));
        }
      }

      const downloadImage = imagesInfo.files.map(
        async (imageInfo: heliotropeImageInfo) => {
          total = imagesInfo.files.length;
          await getImage(api + '/proxy/' + imageInfo.url, imageInfo.name);
        },
      );
      await Promise.all(downloadImage);
      while (failedList.length > 0) {
        tries++;
        setTries(tries);
        count = 0;
        total = failedList.length;

        const tryFailed = failedList.map(async (failedDict) => {
          failedList = failedList.filter((value) => {
            return (
              value['url'] !== failedDict['url'] &&
              value['filename'] !== failedDict['filename']
            );
          });
          return await getImage(failedDict['url'], failedDict['filename']);
        });
        await Promise.all(tryFailed);
      }

      setFailed(0);
      setIsCompress(true);
      await writer.close();
      const content = await blobWriter.getData();
      saveAs(content, `${id}.zip`);
      setIsComplete(true);
      setEndTime(new Date().getTime());
    }
  }

  useEffect(() => {
    mainFunc();
  }, []);

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex direction="column" p={12} rounded={6}>
        {isComplete ? (
          <Heading textAlign="center" mb={7}>
            다운로드 완료 ({endTime - startTime}ms)
          </Heading>
        ) : isCompress ? (
          <Heading textAlign="center" mb={7}>
            압축 중... (시간이 좀 걸릴수도 있어요)
          </Heading>
        ) : (
          <Heading textAlign="center" mb={7}>
            다운로드중... {Number(progress.toFixed(1))}%
          </Heading>
        )}
        <Heading textAlign="center" mb={7}>
          재시도한 횟수 {tries}회
        </Heading>
        <Heading textAlign="center" mb={7}>
          실패한 항목 수: {failed}개
        </Heading>
        <Text fontSize="3xl">실패할경우 실패한 항목만 다시 시도합니다.</Text>
        <Progress
          mt={4}
          isIndeterminate={isCompress && !isComplete}
          value={progress}
        />
      </Flex>
    </Flex>
  );
};

export default Download;
