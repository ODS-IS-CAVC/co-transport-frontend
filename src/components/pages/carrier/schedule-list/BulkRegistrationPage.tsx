'use client';

import { Button } from '@nextui-org/react';
import { useState } from 'react';

import CmnFileUpload from '@/components/common/CmnFileUpload';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { gTxt } from '@/messages/gTxt';

export default function BulkRegistrationPage() {
  const [open, setOpen] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  return (
    <div className='pb-4'>
      <h3>{gTxt('MENU.CARRIER.SCHEDULE_LIST')}</h3>
      <h3 className='mt-4'>一括登録</h3>
      <p className='mt-6'>
        以下説明文は他社サービスの文言を用いたダミーです。
        <br />
        一括登録機能とは、CSVファイルを使うことで、車両情報を一括登録できる機能です。
        <br />
        車両情報にかかる時間と手間を大幅に減らすことができる便利な機能です。
      </p>
      <p className='mt-4'>目次</p>
      <ul className='list-disc list-inside'>
        <li>
          <a
            className='underline'
            href='https://support.mercari-shops.com/hc/ja/articles/8859698858649-%E5%95%86%E5%93%81%E3%82%92%E4%B8%80%E6%8B%AC%E7%99%BB%E9%8C%B2%E3%81%99%E3%82%8B%E9%9A%9B%E3%81%AECSV%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9#h_01GAMVXJYQESBAWW03J4T1B5CK'
          >
            サンプルフォーマット・マスタの取得
          </a>
        </li>
        <li>
          <a
            className='underline'
            href='https://support.mercari-shops.com/hc/ja/articles/8859698858649-%E5%95%86%E5%93%81%E3%82%92%E4%B8%80%E6%8B%AC%E7%99%BB%E9%8C%B2%E3%81%99%E3%82%8B%E9%9A%9B%E3%81%AECSV%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9#h_01GBC2ZXYCES2MC62X0E9XTA97'
          >
            アップロード手順
          </a>
        </li>
        <li>
          <a
            className='underline'
            href='https://support.mercari-shops.com/hc/ja/articles/8859698858649-%E5%95%86%E5%93%81%E3%82%92%E4%B8%80%E6%8B%AC%E7%99%BB%E9%8C%B2%E3%81%99%E3%82%8B%E9%9A%9B%E3%81%AECSV%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9#h_01GBC2ZH8V6RRBPE4RSKG9GY4Z'
          >
            CSVファイル入力例
          </a>
        </li>
      </ul>
      <p className='mt-6'>
        サンプルフォーマット・マスタの取得
        <br />
        以下からダウンロードが可能です。
        <br />
        ※クリックすることでご利用の端末へCSVファイル形式でダウンロードされます。
      </p>
      <p className='mt-4 text-primary'>一括登録テンプレートをダウンロードする(csvファイル)</p>
      <p className='mt-4'>
        ※1行に1商品のデータを入力します
        <br />
        ※入力時の注意点はCSVファイル入力例を参照してください
        <br />
        ※CSVファイル形式のサンプルフォーマットはこちら（windows版・mac版）
      </p>
      <p className='mt-4'>
        アップロード手順
        <br />
        CSVファイルの作成完了後、以下の手順でアップロードを実行してください。
        <br />
        ※一度に最大1,000商品まで登録できます
        <br />
        ※事業種別が「個人事業主」の場合、ショップ開設後の一定期間は商品登録数の上限を200件とさせていただきます。
        商品登録時に「ショップ開設後、一定期間の商品登録数は200件が上限です」とエラーが表示された場合は、日を改めて再度お試しください
        <br />
        <br />
        <br />
        CSVファイル入力例
        <br />
        1行につき1商品のデータを入力します
        <br />
        ※項目の順序入れ替え・削除はおこなえません
        <br />
        ※入力不要な任意の項目については、項目の削除はおこなわずデータ部分を空欄にしてCSVファイルを作成してください
      </p>
      <Button
        color='primary'
        onPress={() => setOpen(true)}
        className='h-6 rounded-lg mt-10 text-xs font-medium leading-[1.125rem]'
      >
        csvファイルアップロード
      </Button>

      <div className='py-6 flex justify-end'>
        <Button color='primary' variant='bordered' className='bg-white border-1 rounded-lg mr-6 font-bold px-2'>
          運送能力・車両情報一覧へ戻る
        </Button>
      </div>
      <CmnModal size='2xl' isOpen={open} onClose={() => setOpen(false)}>
        <CmnModalHeader
          title='csvファイルアップロード'
          description='運送能力・車両情報の一括登録用csvファイルアップロードします。'
        />
        <CmnModalBody className='flex flex-col items-center'>
          <CmnFileUpload
            classNameWrap='w-[22.938rem]'
            getFileSuccess={() => {
              setOpen(false);
              setOpenFile(true);
            }}
          />
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            onPress: () => setOpen(false),
            children: '閉じる',
            className: 'bg-white border-1 rounded-lg mr-6 font-bold px-8',
          }}
          buttonRightSecond={{
            onPress: () => setOpen(false),
            children: 'csvファイルアップロード',
            className: 'rounded-lg font-bold px-8',
          }}
        />
      </CmnModal>
      <CmnModal isOpen={openFile} onClose={() => setOpenFile(false)} size='2xl' radius='none'>
        <CmnModalHeader
          title='csvファイルアップロード'
          description='運送能力・車両情報の一括登録用csvファイルアップロードが完了しました。'
        />
        <CmnModalBody>
          <div className='py-6 text-sm font-normal leading-[1.531rem]'>
            <p>{'・運送能力・車両情報　　 24件成功'}</p>
            <p className='mt-6'>一括登録した内容は運送能力・車両情報一覧からご確認いただけます。</p>
          </div>
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            onPress: () => setOpenFile(false),
            children: '閉じる',
            className: 'bg-white border-1 rounded-lg mr-6 font-bold px-8',
          }}
          buttonRightSecond={{
            onPress: () => setOpenFile(false),
            children: '運送能力・車両情報一覧へ',
            className: 'rounded-lg font-bold px-8',
          }}
        />
      </CmnModal>
    </div>
  );
}
