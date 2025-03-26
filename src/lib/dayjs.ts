// utils/dayjs.ts
import 'dayjs/locale/ja';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.locale('ja');

export default dayjs;
