import type { VercelRequest, VercelResponse } from '@vercel/node';
// import { waitUntil } from '@vercel/functions';
import { getEventType, sendFeishuMessage } from '../src/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // const { name = 'World' } = req.query;
  // return res.json({
  //   message: `Hello ${name}!`,
  // });
  console.log('Function Called');
  try {
    const PASSCODE = process.env.PASSCODE as string;

    if (req.method !== 'POST' || !req.body) {
      return res.status(400).json({
        message: 'Bad Request',
      });
    }

    const requestBody = req.body;

    if (requestBody.passcode !== PASSCODE) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const eventType = getEventType(requestBody);

    console.log(eventType);

    await sendFeishuMessage(requestBody);

    return res.status(200).json({
      message: 'ok',
    });
    // if (eventType) {
    //   console.log(eventType);
    //   waitUntil(sendFeishuMessage(requestBody).then((json) => {
    //     console.log('Push to Feishu: ', JSON.stringify(json));
    //   }));
    //   // context.waitUntil(sendFeishuMessage(requestBody).then((json) => {
    //   //   console.log(json);
    //   // }));
    // }
    // return res.status(400).json({
    //   message: 'not working',
    // });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
}
