/* eslint-disable no-case-declarations */
import 'dotenv/config';
import {
  EEvents,
  ILibraryPublish,
  TEvent,
} from '../types';

export const getEventType = (requestBody: any): EEvents | null => {
  if (requestBody.event_type && typeof requestBody.event_type === 'string') {
    if (Object.values(EEvents).includes(requestBody.event_type)) {
      return requestBody.event_type as EEvents;
    }
  }
  return null;
};

const getMessage = (event: TEvent): object => {
  const getFileUrl = (fileKey: string, fileName: string) => `https://www.figma.com/file/${fileKey}/${fileName.replace(/ /g, '-')}`;

  switch (event.event_type) {
    case EEvents.LIBRARY_PUBLISH:
      const libraryUpdate = event as ILibraryPublish;
      const cardData = {
        elements: [
          {
            tag: 'div',
            text: {
              content: `文件: **${libraryUpdate.file_name}**
              \n用户: **${libraryUpdate.triggered_by.handle}**
              \n描述: **${libraryUpdate.description}**`,
              tag: 'lark_md',
            },
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  content: '查看变更',
                  tag: 'lark_md',
                },
                url: `${getFileUrl(libraryUpdate.file_key, libraryUpdate.file_name)}`,
                type: 'default',
                value: {},
              },
            ],
          },
        ],
        header: {
          title: {
            content: '🧩 Figma Library 有更新啦',
            tag: 'plain_text',
          },
        },
      };
      return cardData;
    case EEvents.FILE_DELETE:
      // const fileDelete = event as IFileDete;
      // return `
      //   🗑️ ${fileDelete.file_name} is deleted by ${fileDelete.triggered_by.handle}
      //   \n${getFileUrl(fileDelete.file_key, fileDelete.file_name)}
      //   `;
      return {};
    default:
      return {};
  }
};

const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL as string;

export const sendFeishuMessage = async (event: TEvent): Promise<void> => {
  const message = getMessage(event);
  const payload = {
    msg_type: 'interactive',
    card: message,
  };
  console.log(FEISHU_WEBHOOK_URL);
  console.log(JSON.stringify(payload));

  try {
    const response = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    console.log('飞书推送成功', body);
  } catch (error) {
    console.log('飞书推送失败', JSON.stringify(error));
    throw new Error(`Error posting to Feishu: ${error}`);
  }
};
