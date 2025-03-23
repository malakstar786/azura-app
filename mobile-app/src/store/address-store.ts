import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Address = {
  id: string;
  fullName: string;
  mobileNumber: string;
  country: string;
  city: string;
  area: string;
  block: string;
  street: string;
  houseBuilding: string;
  apartment: string;
  addressLine2: string;
};

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  selectAddress: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddress: null,
      addAddress: (address) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          addresses: [...state.addresses, { ...address, id }],
          selectedAddress: state.addresses.length === 0 ? { ...address, id } : state.selectedAddress,
        }));
      },
      updateAddress: (id, updatedAddress) => {
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...updatedAddress } : addr
          ),
          selectedAddress:
            state.selectedAddress?.id === id
              ? { ...state.selectedAddress, ...updatedAddress }
              : state.selectedAddress,
        }));
      },
      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
          selectedAddress:
            state.selectedAddress?.id === id ? null : state.selectedAddress,
        }));
      },
      selectAddress: (id) => {
        set((state) => ({
          selectedAddress: state.addresses.find((addr) => addr.id === id) || null,
        }));
      },
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 