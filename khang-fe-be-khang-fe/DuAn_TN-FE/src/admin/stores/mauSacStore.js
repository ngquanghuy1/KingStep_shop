import { create } from 'zustand';

const initialMauSacData = [
  {
    ID: '1',
    MaMauSac: 'MS001',
    TenMauSac: 'Đỏ',
    TrangThai: 'Đang hoạt động',
  },
  {
    ID: '2',
    MaMauSac: 'MS002',
    TenMauSac: 'Xanh',
    TrangThai: 'Đang hoạt động',
  },
  {
    ID: '3',
    MaMauSac: 'MS003',
    TenMauSac: 'Vàng',
    TrangThai: 'Đang hoạt động',
  },
];

const useMauSacStore = create((set) => ({
  mauSacData: initialMauSacData,
  setMauSacData: (newData) => set({ mauSacData: newData }),
  addMauSac: (newItem) => set((state) => ({ 
    mauSacData: [...state.mauSacData, newItem] 
  })),
  updateMauSac: (updatedItem) => set((state) => ({
    mauSacData: state.mauSacData.map(item => 
      item.ID === updatedItem.ID ? updatedItem : item
    )
  })),
  deleteMauSac: (id) => set((state) => ({
    mauSacData: state.mauSacData.filter(item => item.ID !== id)
  })),
}));

export default useMauSacStore; 