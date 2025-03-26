import Image from 'next/image';

import trat from '@/icons/icons-svg/trat.svg';
const TratLogo = () => <Image src={trat} alt='Trat Logo' loading={'lazy'} className='object-contain' />;

export default TratLogo;
