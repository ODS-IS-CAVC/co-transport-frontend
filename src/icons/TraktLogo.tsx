import Image from 'next/image';

import trakt from '@/icons/icons-svg/trakt.svg';
const TraktLogo = () => <Image src={trakt} alt='Trakt Logo' loading={'lazy'} />;

export default TraktLogo;
