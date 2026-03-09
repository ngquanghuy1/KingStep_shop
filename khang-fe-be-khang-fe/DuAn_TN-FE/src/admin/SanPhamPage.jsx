import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios";
import {

  Input, Switch
} from "antd";

import "../styles/AdminPanel.css";
import "../styles/SalePage.css";


const SanPhamPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [material, setMaterial] = useState("");
  const [origin, setOrigin] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    tenSanPham: "",
    idDanhMuc: "",
    idThuongHieu: "",
    idChatLieu: "",
    idXuatXu: "",
    idKhuyenMai: "",
    giaBan: "",
    giaGiamGia: "",
    trangThai: 1,
    imanges: ""
  });
  const [loading, setLoading] = useState(false);
  const [trangThai, setTrangThai] = useState("");

  // Phân trang
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5); // Số dòng/trang mặc định là 5
  const [totalPages, setTotalPages] = useState(1);

  // Fetch sản phẩm phân trang, chỉ truyền size khi người dùng chọn lại
  const fetchProductsPage = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/san-pham/getAll"
      );

      console.log("Danh sách sản phẩm:", res.data);

      setProducts(res.data || []);
      const list = res.data || [];
      setProducts(list);
      setTotalPages(Math.ceil(list.length / size));
    } catch (error) {
      console.error("Lỗi load sản phẩm:", error);
      setProducts([]);
    }
  };


  // Gọi lại khi page, size, filter, search thay đổi
  useEffect(() => {
    fetchProductsPage();
  }, [size]);


  // Tạo mảng số trang
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  // Sửa sản phẩm
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editId, setEditId] = useState(null);





  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Thêm state cho lỗi tên sản phẩm
  const [addNameError, setAddNameError] = useState("");
  const [editNameError, setEditNameError] = useState("");




  // Lấy danh sách sản phẩm
  // Lấy danh mục
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/danh-muc/getAll")
      .then((res) => {
        console.log("Danh mục:", res.data);
        // Đảm bảo luôn là mảng để tránh lỗi .map khi API trả về undefined/null
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  // Lấy thương hiệu
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/thuong-hieu/getAll")
      .then((res) => {
        console.log("Thương hiệu:", res.data);
        // Đảm bảo luôn là mảng
        setBrands(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setBrands([]));
  }, []);

  // Lấy chất liệu
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/chat-lieu/getAll")
      .then((res) => {
        // Đảm bảo luôn là mảng
        setMaterials(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setMaterials([]));
  }, []);

  // Lấy xuất xứ
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/xuat-xu/getAll")
      .then((res) => {
        // Đảm bảo luôn là mảng
        setOrigins(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setOrigins([]));
  }, []);



  // Xử lý thêm sản phẩm
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddNameError("");
    setLoading(true);
    const data = {
      tenSanPham: addForm.tenSanPham,
      thuongHieu: {
        id: addForm.idThuongHieu,
      },
      xuatXu: {
        id: addForm.idXuatXu
      },
      khuyenMai: {
        id: addForm.idKhuyenMai
      },
      chatLieu: {
        id: addForm.idChatLieu

      },
      danhMuc: {
        id: addForm.idDanhMuc
      },
      imanges: Array.isArray(addForm.imanges) ? addForm.imanges.join(',') : addForm.imanges
    };
    try {
      const res = await axios.post("http://localhost:8080/api/san-pham/add", {
        ...data,
        giaBan: Number(addForm.giaBan),
        giaGiamGia: addForm.giaGiamGia ? Number(addForm.giaGiamGia) : 0,
        trangThai: Number(addForm.trangThai),
      });
      setShowAddModal(false);
      setAddForm({
        tenSanPham: "",
        idDanhMuc: "",
        idThuongHieu: "",
        idChatLieu: "",
        idXuatXu: "",
        idKhuyenMai: "",
        giaBan: "",
        giaGiamGia: "",
        trangThai: 1,
        imanges: ""
      });
      // Chuyển hướng sang trang chi tiết sản phẩm vừa tạo
      navigate(`/admin-panel/products/${res.data.id}`);
    } catch (err) {
      if (err.response && err.response.data) {
        const msg = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message;
        setAddNameError(msg);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Thêm sản phẩm thất bại',
          text: err.message || 'Có lỗi xảy ra!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1800,
          width: 250
        });
      }
    }
    setLoading(false);
  };



  // Xử lý sửa sản phẩm
  const openEditModal = (product) => {
    setEditId(product.id);
    setEditForm({
      tenSanPham: product.tenSanPham || "",
      idDanhMuc: product.danhMuc?.id || "",
      idThuongHieu: product.thuongHieu?.id || "",
      idChatLieu: product.chatLieu?.id || "",
      idXuatXu: product.xuatXu?.id || "",
      idKhuyenMai: product.khuyenMai?.id || "",
      giaBan: product.giaBan || "",
      giaGiamGia: product.giaGiamGia || "",
      trangThai: product.trangThai,
      imanges: product.imanges || ""
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setEditNameError("");
    setLoading(true);
    const data = {
      tenSanPham: editForm.tenSanPham,
      thuongHieu: { id: editForm.idThuongHieu },
      xuatXu: { id: editForm.idXuatXu },
      chatLieu: { id: editForm.idChatLieu },
      danhMuc: { id: editForm.idDanhMuc },
      giaBan: Number(editForm.giaBan),
      giaGiamGia: editForm.giaGiamGia ? Number(editForm.giaGiamGia) : 0,
      trangThai: Number(editForm.trangThai),
      imanges: editForm.imanges
    };
    if (editForm.idKhuyenMai) {
      data.khuyenMai = { id: editForm.idKhuyenMai };
    } else {
      data.khuyenMai = null;
    }
    try {
      await axios.put(`http://localhost:8080/api/san-pham/${editId}`, data);
      setShowEditModal(false);
      setEditId(null);
      setEditForm({});
      fetchProductsPage(page, size);
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    } catch (err) {
      if (err.response && err.response.data) {
        const msg = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message;
        setEditNameError(msg);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Cập nhật thất bại',
          text: err.message || 'Có lỗi xảy ra!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          width: 250
        });
      }
    }
    setLoading(false);
  };













  // Hàm upload ảnh cho form sửa
  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingEditImage(true);
    try {
      const res = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.fileName) {
        setEditForm(f => ({ ...f, imanges: data.fileName }));
      } else {
        alert('Upload ảnh thất bại!');
      }
    } catch (err) {
      alert('Upload ảnh thất bại!');
    }
    setUploadingEditImage(false);
  };





  const handleSoftDeleteProduct = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:8080/api/san-pham/${id}`);
        Swal.fire('Thành công!', 'Sản phẩm đã được chuyển trạng thái.', 'success');
        fetchProductsPage(page, size);
      }
    } catch (error) {
      Swal.fire('Thất bại!', 'Không thể xóa sản phẩm. Vui lòng thử lại.', 'error');
    }
  };

  // Thêm lại hàm async handleMultiImageUpload cho upload nhiều ảnh
  const handleMultiImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files); // Debug log

    if (files.length === 0) {
      console.log('No files selected');
      return;
    }

    let uploaded = [];
    setUploadingEditImage(true);

    try {
      for (let file of files) {
        console.log('Uploading file:', file.name, 'Size:', file.size); // Debug log

        const formData = new FormData();
        formData.append('file', file);

        console.log('Sending request to: http://localhost:8080/api/upload'); // Debug log

        console.log('FormData content:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const res = await fetch('http://localhost:8080/api/upload', {
          method: 'POST',
          body: formData
        });

        console.log('Upload response status:', res.status); // Debug log
        console.log('Upload response headers:', res.headers); // Debug log

        if (res.ok) {
          const data = await res.json();
          console.log('Upload response data:', data); // Debug log

          if (data && data.fileName) {
            uploaded.push(data.fileName);
            console.log('Successfully uploaded:', data.fileName); // Debug log
          } else {
            console.error('No fileName in response:', data); // Debug log
            alert(`Upload ảnh ${file.name} thất bại: Không nhận được tên file`);
          }
        } else {
          console.error('Upload failed with status:', res.status); // Debug log
          const errorText = await res.text();
          console.error('Error response:', errorText); // Debug log
          alert(`Upload ảnh ${file.name} thất bại: ${res.status} - ${errorText}`);
        }
      }

      console.log('Final uploaded array:', uploaded); // Debug log
      console.log('Setting addForm.imanges to:', uploaded); // Debug log
      setAddForm(f => {
        const newForm = { ...f, imanges: uploaded };
        console.log('New addForm:', newForm); // Debug log
        return newForm;
      });

    } catch (err) {
      console.error('Upload error:', err); // Debug log
      console.error('Error details:', err.message, err.stack); // Debug log
      alert('Upload ảnh thất bại: ' + err.message);
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleChangeTrangThai = async (product) => {
    if (product.trangThai === 1) {
      // Đang bán -> Ngừng bán: hỏi xác nhận
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn ngừng bán sản phẩm này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Có',
        cancelButtonText: 'Không',
      });
      if (!result.isConfirmed) return;
      try {
        await axios.delete(`http://localhost:8080/api/san-pham/${product.id}`);
        fetchProductsPage(page, size);
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật trạng thái thành công!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          width: 250
        });
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể cập nhật trạng thái', 'error');
      }
    } else {
      // Ngừng bán -> Đang bán: hỏi xác nhận
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn chuyển sang đang bán sản phẩm này?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Có',
        cancelButtonText: 'Không',
      });
      if (!result.isConfirmed) return;
      try {
        await axios.put(`http://localhost:8080/api/san-pham/khoi-phuc/${product.id}`);
        fetchProductsPage(page, size);
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật trạng thái thành công!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          width: 250
        });
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể cập nhật trạng thái', 'error');
      }
    }
  };

  // Thêm lại hàm xử lý đường dẫn ảnh ở đầu component
  const getImageUrl = (img) => {
    if (!img) return "/logo.png";

    if (Array.isArray(img)) img = img[0];
    if (typeof img === "string" && img.includes(",")) {
      img = img.split(",")[0];
    }

    img = img.trim();
    if (!img) return "/logo.png";

    if (img.startsWith("http")) return img;

    return `http://localhost:8080/images/${encodeURIComponent(img)}`;
  };

  // Thêm hàm xử lý đổi trạng thái biến thể sản phẩm


  const navigate = useNavigate();

  return (

    <div
      className="banhang-container"
      style={{ flexDirection: "column", gap: 24 }}
    >

      {/* Thanh công cụ */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >

        {/* Thay đổi layout: input tìm kiếm nằm trên, các select filter xếp dọc bên dưới */}
        {/* Đưa 2 nút sang góc trên bên phải, cùng hàng, căn phải */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 8 }}>
            <button
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
              }}
              onClick={() => setShowAddModal(true)}
            >
              + Thêm sản phẩm
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value); }}
              style={{
                width: 160,
                padding: '6px 8px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: 140,
                padding: '6px 8px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            >
              <option value="">Danh mục</option>
              {categories.map((dm) => (
                <option key={dm.id} value={dm.id}>
                  {dm.tenDanhMuc}
                </option>
              ))}
            </select>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={{
                width: 140,
                padding: '6px 8px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            >
              <option value="">Thương hiệu</option>
              {brands.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.tenThuongHieu}
                </option>
              ))}
            </select>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              style={{
                width: 140,
                padding: '6px 8px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            >
              <option value="">Chất liệu</option>
              {materials.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.tenChatLieu}
                </option>
              ))}
            </select>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={{
                width: 140,
                padding: '6px 8px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            >
              <option value="">Xuất xứ</option>
              {origins.map((xx) => (
                <option key={xx.id} value={xx.id}>
                  {xx.tenXuatXu}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span><strong>Trạng thái:</strong></span>

              <label>
                <input
                  type="radio"
                  name="trangThai"
                  value=""
                  checked={trangThai === ""}
                  onChange={() => setTrangThai("")}
                /> Tất cả
              </label>
              <label>
                <input
                  type="radio"
                  name="trangThai"
                  value="1"
                  checked={trangThai === "1"}
                  onChange={() => setTrangThai("1")}
                /> Đang bán
              </label>
              <label>
                <input
                  type="radio"
                  name="trangThai"
                  value="0"
                  checked={trangThai === "0"}
                  onChange={() => setTrangThai("0")}
                /> Ngừng bán
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* Modal thêm sản phẩm */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Thêm sản phẩm mới</h2>
            <form
              onSubmit={handleAddProduct}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <Input
                required
                placeholder="Tên sản phẩm"
                value={addForm.tenSanPham}
                onChange={(e) => setAddForm((f) => ({ ...f, tenSanPham: e.target.value }))}
              />
              {addNameError && <span style={{ color: 'red' }}>{addNameError}</span>}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultiImageUpload}
                style={{ marginBottom: 8 }}
              />
              {uploadingEditImage && (
                <div style={{ color: 'blue', fontSize: '14px', marginBottom: 8 }}>
                  ⏳ Đang upload ảnh...
                </div>
              )}
              {console.log('Rendering addForm.imanges:', addForm.imanges)} {/* Debug log */}
              {Array.isArray(addForm.imanges) && addForm.imanges.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {addForm.imanges.map((img, idx) => {
                    const imgSrc = getImageUrl(img);
                    console.log(`Rendering image ${idx}:`, imgSrc); // Debug log
                    return (
                      <img
                        key={idx}
                        src={imgSrc}
                        alt={`Ảnh ${idx + 1}`}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                        onError={(e) => {
                          console.error(`Image failed to load: ${imgSrc}`);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Image loaded successfully: ${imgSrc}`); // Debug log
                        }}
                      />
                    );
                  })}
                </div>
              )}
              {!addForm.idDanhMuc && (
                <span style={{ color: "red" }}>Chọn danh mục!</span>
              )}
              <select
                required
                value={addForm.idDanhMuc}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    idDanhMuc: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((dm) => (
                  <option key={dm.id} value={dm.id}>
                    {dm.tenDanhMuc}
                  </option>
                ))}
              </select>
              <select
                required
                value={addForm.idThuongHieu}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    idThuongHieu: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((th) => (
                  <option key={th.id} value={th.id}>
                    {th.tenThuongHieu}
                  </option>
                ))}
              </select>
              <select
                required
                value={addForm.idChatLieu}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    idChatLieu: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn chất liệu</option>
                {materials.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.tenChatLieu}
                  </option>
                ))}
              </select>
              <select
                required
                value={addForm.idXuatXu}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    idXuatXu: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn xuất xứ</option>
                {origins.map((xx) => (
                  <option key={xx.id} value={xx.id}>
                    {xx.tenXuatXu}
                  </option>
                ))}
              </select>

              <select
                value={addForm.trangThai}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, trangThai: e.target.value }))
                }
              >
                <option value={1}>Đang bán</option>
                <option value={0}>Ngừng bán</option>
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa sản phẩm */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sửa sản phẩm</h2>
            <form
              onSubmit={handleEditProduct}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <Input
                required
                placeholder="Tên sản phẩm"
                value={editForm.tenSanPham}
                onChange={(e) => setEditForm((f) => ({ ...f, tenSanPham: e.target.value }))}
              />
              {editNameError && <span style={{ color: 'red' }}>{editNameError}</span>}
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
                style={{ marginBottom: 8 }}
              />
              {uploadingEditImage && <span>Đang upload ảnh...</span>}
              {editForm.imanges && (
                <img
                  src={getImageUrl(editForm.imanges)}
                  alt={editForm.tenSanPham}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                  onError={(e) => {
                    console.error(`Edit image failed to load: ${editForm.imanges}`);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log(`Edit image loaded successfully: ${editForm.imanges}`);
                  }}
                />
              )}
              {!editForm.idDanhMuc && (
                <span style={{ color: "red" }}>Chọn danh mục!</span>
              )}
              <select
                required
                value={editForm.idDanhMuc}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    idDanhMuc: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn danh mục</option>
                {categories.map((dm) => (
                  <option key={dm.id} value={dm.id}>
                    {dm.tenDanhMuc}
                  </option>
                ))}
              </select>
              <select
                required
                value={editForm.idThuongHieu}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    idThuongHieu: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((th) => (
                  <option key={th.id} value={th.id}>
                    {th.tenThuongHieu}
                  </option>
                ))}
              </select>
              <select
                required
                value={editForm.idChatLieu}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    idChatLieu: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn chất liệu</option>
                {materials.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.tenChatLieu}
                  </option>
                ))}
              </select>
              <select
                required
                value={editForm.idXuatXu}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    idXuatXu: e.target.value ? Number(e.target.value) : "",
                  }))
                }
              >
                <option value="">Chọn xuất xứ</option>
                {origins.map((xx) => (
                  <option key={xx.id} value={xx.id}>
                    {xx.tenXuatXu}
                  </option>
                ))}
              </select>

              <select
                value={editForm.trangThai}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, trangThai: e.target.value }))
                }
              >
                <option value={1}>Đang bán</option>
                <option value={0}>Ngừng bán</option>
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Chọn số dòng/trang */}
      <div style={{ margin: '16px 0' }}>
        <label>
          Số dòng/trang:&nbsp;
          <select value={size} onChange={e => { setPage(0); setSize(Number(e.target.value)); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      {/* Bảng danh sách sản phẩm */}
      <div style={{ overflowX: "auto" }}>
        <table
          className="cart-table"
          style={{ minWidth: 1000, background: "#fff" }}
        >
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Chất liệu</th>
              <th>Xuất xứ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((product) => {
                const matchSearch =
                  product.tenSanPham
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

                const matchCategory =
                  !category || product.danhMuc?.id === Number(category);

                const matchBrand =
                  !brand || product.thuongHieu?.id === Number(brand);

                const matchMaterial =
                  !material || product.chatLieu?.id === Number(material);

                const matchOrigin =
                  !origin || product.xuatXu?.id === Number(origin);

                const matchTrangThai =
                  trangThai === "" ||
                  product.trangThai === Number(trangThai);

                return (
                  matchSearch &&
                  matchCategory &&
                  matchBrand &&
                  matchMaterial &&
                  matchOrigin &&
                  matchTrangThai
                );
              })
              .slice(page * size, page * size + size)
              .map((product) => (
                <React.Fragment key={product.id}>
                  <tr>
                    <td style={{ width: 80, height: 80, textAlign: 'center', verticalAlign: 'middle' }}>
                      <img
                        src={getImageUrl(product.imanges)}
                        alt={"Không có ảnh"}
                        style={{
                          width: 100,
                          height: 80,
                          borderRadius: 6,
                          objectFit: "cover",
                          display: "block",
                          margin: "auto",
                          background: "#f6f8fa"
                        }}
                        onError={e => {
                          console.error(`Product image failed to load: ${product.imanges}`);
                          e.target.src = "/logo.png";
                        }}
                      />
                    </td>
                    <td>{product.tenSanPham}</td>
                    <td>{product.danhMuc?.tenDanhMuc || "-"}</td>
                    <td>{product.thuongHieu?.tenThuongHieu || "-"}</td>
                    <td>{product.chatLieu?.tenChatLieu || "-"}</td>
                    <td>{product.xuatXu?.tenXuatXu || "-"}</td>
                    <td>
                      <Switch
                        checked={product.trangThai === 1}
                        checkedChildren=""
                        unCheckedChildren=""
                        style={{ backgroundColor: product.trangThai === 1 ? '#43a047' : '#e53935' }}
                        onChange={() => handleChangeTrangThai(product)}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => openEditModal(product)}
                        style={{
                          background: "#43a047",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          marginRight: 4,
                          cursor: "pointer",
                          opacity: 0.7,
                        }}
                      >
                        Sửa
                      </button>
                      {/* <button
                      onClick={() => handleSoftDeleteProduct(product.id)}
                      style={{
                        background: "#e53935",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 10px",
                        marginRight: 4,
                        cursor: "pointer",
                        opacity: 0.7,
                      }}
                    >
                      Xóa
                    </button> */}
                      <button
                        onClick={() => navigate(`/admin-panel/products/${product.id}`)}
                        style={{
                          background: "#1976d2",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                          opacity: 0.7,
                        }}
                      >
                        Chi tiết
                      </button>

                    </td>
                  </tr>
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {/* Nút phân trang */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
        {pageNumbers.map(num => (
          <button
            key={num}
            style={{
              fontWeight: num === page ? 'bold' : 'normal',
              margin: '0 2px',
              background: num === page ? '#1976d2' : '#fff',
              color: num === page ? '#fff' : '#1976d2',
              border: '1px solid #1976d2',
              borderRadius: 4,
              padding: '2px 8px'
            }}
            onClick={() => setPage(num)}
          >
            {num + 1}
          </button>
        ))}
        <button disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}>Sau</button>
      </div>




    </div>
  );
};

export default SanPhamPage;
