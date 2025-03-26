import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useState } from 'react';

import { gTxt } from '@/messages/gTxt';
import { UserInfo } from '@/types/auth';

import { Icon } from '../common/Icon';

interface ProfileMenuProps {
  userInfo: UserInfo;
  actionLogout: () => void;
}

export const ProfileMenu = (props: ProfileMenuProps) => {
  const { userInfo, actionLogout } = props;

  const profileMenuItems = [
    {
      label: gTxt('COMMON.MENU_PROFILE.MY_PROFILE'),
      icon: 'account_circle',
    },
    {
      label: gTxt('COMMON.MENU_PROFILE.HELP'),
      icon: 'help',
    },
    {
      label: gTxt('COMMON.MENU_PROFILE.LOGOUT'),
      icon: 'logout',
      action: actionLogout,
    },
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} placement='bottom-end'>
      <DropdownTrigger>
        <div className='flex items-center space-x-2'>
          <Avatar as='button' className='transition-transform' color='secondary' name={userInfo.name} size='sm' />
          <div className='text-start'>
            <p className='text-sm sm:text-base font-semibold truncate'>{userInfo.name}</p>
            <p className='text-xs sm:text-sm font-normal text-foreground truncate'>{userInfo.companyName}</p>
          </div>
          <a className='cursor-pointer flex items-center justify-center'>
            <Icon icon={isMenuOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={20}></Icon>
          </a>
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label='Profile Actions' variant='flat'>
        {profileMenuItems.map(({ label, icon }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <DropdownItem key={key} className='gap-2' onPress={isLastItem ? actionLogout : () => {}}>
              <div className='flex items-center space-x-4'>
                <Icon icon={icon} size={24} className={`${isLastItem ? 'text-red-500' : ''}`} />
                <p className='text-sm sm:text-base font-medium truncate'>{label}</p>
              </div>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};
