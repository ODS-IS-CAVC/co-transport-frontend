'use client';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

interface DownloadCsvTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadCsvTemplateModal = (props: DownloadCsvTemplateModalProps) => {
  const { isOpen, onClose } = props;

  return (
    <Modal isOpen={isOpen} placement='center' size='4xl' hideCloseButton={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col p-8 gap-4'>
          <label className='text-h1'>一括登録テンプレートについて</label>
          <p className='text-xs mt-4'>
            一括登録の手順について確認、また、一括登録に使用するテンプレート(CSVファイル)はこのページからダウンロードできます。
          </p>
        </ModalHeader>
        <ModalBody className='flex flex-col text-xs p-8'>
          <p>
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
        </ModalBody>
        <ModalFooter className='flex items-center justify-center'>
          <Button className='bg-background text-primary text-base font-bold' radius='sm' onPress={onClose}>
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DownloadCsvTemplateModal;
