import { useCallback, useState } from 'react';

type ModalsState<T extends string> = Record<T, boolean>;

function useModals<T extends string>(initialState: ModalsState<T>) {
  const [modals, setModals] = useState<ModalsState<T>>(initialState);

  const toggleModal = useCallback((modalName: T) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  const openModal = useCallback((modalName: T) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: T) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const resetModals = useCallback(() => {
    setModals(initialState);
  }, [initialState]);

  return { modals, toggleModal, openModal, closeModal, resetModals };
}

export default useModals;
