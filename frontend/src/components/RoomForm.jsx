import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { getStaticFileUrl } from '../lib/utils';

const RoomForm = ({ room, onSubmit, onCancel }) => {
  const defaultFormData = {
    name: '',
    description: '',
    capacity: '',
    type: 'medium', // Mặc định là phòng vừa
    equipment: [],
    image: null
  };

  const [formData, setFormData] = useState(
    room
      ? {
          name: room.name,
          description: room.description,
          capacity: room.capacity,
          type: room.type,
          equipment: room.equipment || [],
          image: room.image
        }
      : defaultFormData
  );
  
  const [equipmentInput, setEquipmentInput] = useState('');
  // ✅ Nếu room có ảnh, hiển thị URL đầy đủ
  const [preview, setPreview] = useState(
    room?.image ? getStaticFileUrl(room.image) : null
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Lấy giới hạn capacity dựa trên loại phòng
  const getCapacityLimits = () => {
    switch (formData.type) {
      case 'small':
        return { min: 1, max: 10 };
      case 'medium':
        return { min: 11, max: 20 };
      case 'large':
        return { min: 21, max: 50 };
      default:
        return { min: 1, max: 50 };
    }
  };

  const capacityLimits = getCapacityLimits();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)');
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        e.target.value = ''; // Reset input
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddEquipment = () => {
    const equipment = equipmentInput.trim();
    
    if (!equipment) {
      toast.error('Vui lòng nhập tên thiết bị');
      return;
    }

    if (equipment.length < 2) {
      toast.error('Tên thiết bị phải có ít nhất 2 ký tự');
      return;
    }

    if (equipment.length > 50) {
      toast.error('Tên thiết bị không được quá 50 ký tự');
      return;
    }

    if (formData.equipment.includes(equipment)) {
      toast.error('Thiết bị này đã được thêm');
      return;
    }

    if (formData.equipment.length >= 20) {
      toast.error('Chỉ được thêm tối đa 20 thiết bị');
      return;
    }

    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, equipment]
    }));
    setEquipmentInput('');
  };

  const handleRemoveEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data - Check tất cả field bắt buộc
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Tên phòng là bắt buộc');
      }

      if (!formData.description || !formData.description.trim()) {
        throw new Error('Mô tả phòng là bắt buộc');
      }

      if (!formData.type) {
        throw new Error('Loại phòng là bắt buộc');
      }

      if (!formData.capacity || formData.capacity <= 0) {
        throw new Error('Sức chứa phải là số dương');
      }

      // Validate thiết bị bắt buộc
      if (!formData.equipment || formData.equipment.length === 0) {
        throw new Error('Phải thêm ít nhất 1 thiết bị cho phòng');
      }

      // Validate ảnh bắt buộc
      if (!formData.image) {
        throw new Error('Ảnh phòng họp là bắt buộc');
      }

      // Validate capacity phải là số hợp lệ
      const cap = parseInt(formData.capacity);
      if (isNaN(cap)) {
        throw new Error('Sức chứa phải là một số hợp lệ');
      }

      if (formData.type === 'small' && (cap < 1 || cap > 10)) {
        throw new Error('Phòng nhỏ chỉ chứa từ 1-10 người');
      } else if (formData.type === 'medium' && (cap < 11 || cap > 20)) {
        throw new Error('Phòng vừa chỉ chứa từ 11-20 người');
      } else if (formData.type === 'large' && (cap < 21 || cap > 50)) {
        throw new Error('Phòng lớn chỉ chứa từ 21-50 người');
      }

      // Chuẩn bị dữ liệu gửi lên API
      const formDataToSend = new FormData();
      
      // Thêm các trường cơ bản
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('capacity', parseInt(formData.capacity));
      formDataToSend.append('type', formData.type);
      formDataToSend.append('status', 'available');

      // Thêm danh sách thiết bị
      formData.equipment.forEach((item, index) => {
        formDataToSend.append(`equipment[${index}]`, item);
      });
      
      // 🔍 Debug: Log FormData
      console.log('📦 FormData to send:');
      console.log('  - name:', formData.name);
      console.log('  - description:', formData.description);
      console.log('  - capacity:', formData.capacity);
      console.log('  - type:', formData.type);
      console.log('  - equipment:', formData.equipment);
      console.log('  - image:', formData.image);
      
      // Log all FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log('  -', pair[0], ':', pair[1]);
      }

      // Thêm ảnh nếu có
      if (formData.image && formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      await onSubmit(formDataToSend);
      // Toast được xử lý bởi useRooms hook
    } catch (error) {
      console.error('Form error:', error);
      // Hiển thị lỗi từ server hoặc lỗi validation
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Thông báo hướng dẫn */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-blue-700">
              Phòng mới sẽ được tạo với trạng thái "Có sẵn". Trạng thái sẽ tự động cập nhật khi:
              <br />• Nhân viên đặt phòng → "Chờ duyệt"
              <br />• Admin duyệt đặt phòng → "Đã được đặt"
            </p>
          </div>
        </div>

        {/* Tên phòng */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Tên phòng <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Nhập tên phòng..."
            value={formData.name}
            onChange={handleChange}
            className="mt-1.5 border-slate-300 focus:ring-slate-900"
            required
          />
        </div>

        {/* Mô tả */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Mô tả <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="description"
            name="description"
            placeholder="Nhập mô tả về phòng..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 mt-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Sức chứa + Loại phòng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacity" className="text-sm font-medium">
              Sức chứa <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={capacityLimits.min}
                max={capacityLimits.max}
                placeholder={`${capacityLimits.min}-${capacityLimits.max} người`}
                value={formData.capacity}
                onChange={handleChange}
                className="pl-10 border-slate-300 focus:ring-slate-900"
                required
              />
              <span className="absolute left-3 top-2.5 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formData.type === 'small' && 'Phòng nhỏ: 1-10 người'}
              {formData.type === 'medium' && 'Phòng vừa: 11-20 người'}
              {formData.type === 'large' && 'Phòng lớn: 21-50 người'}
            </p>
          </div>

          <div>
            <Label htmlFor="type" className="text-sm font-medium">
              Loại phòng
            </Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1.5 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Chọn loại phòng --</option>
              <option value="Phòng nhỏ">Phòng nhỏ (1-10 người)</option>
              <option value="Phòng trung bình">Phòng trung bình (11-20 người)</option>
              <option value="Phòng lớn">Phòng lớn (21-50 người)</option>
            </select>
          </div>
        </div>

        {/* Thiết bị */}
        <div>
          <Label htmlFor="equipment" className="text-sm font-medium">
            Thiết bị <span className="text-red-500">*</span> <span className="text-slate-400 text-xs font-normal">(Tối đa 20, ít nhất 1)</span>
          </Label>
          <div className="mt-1.5 space-y-3">
            <div className="flex space-x-2">
              <Input
                id="equipment"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                placeholder="Nhập tên thiết bị (2-50 ký tự)..."
                maxLength={50}
                className="border-slate-300 focus:ring-slate-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquipment();
                  }
                }}
                disabled={formData.equipment.length >= 20}
              />
              <Button
                type="button"
                onClick={handleAddEquipment}
                className="whitespace-nowrap bg-slate-900 hover:bg-slate-800"
                disabled={formData.equipment.length >= 20}
              >
                Thêm thiết bị
              </Button>
            </div>
            {formData.equipment.length > 0 ? (
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  {formData.equipment.length}/20 thiết bị
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.equipment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(index)}
                        className="ml-2 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Bắt buộc: Phải thêm ít nhất 1 thiết bị cho phòng
              </p>
            )}
          </div>
        </div>

        {/* Ảnh phòng họp */}
        <div>
          <Label htmlFor="image" className="text-sm font-medium">
            Ảnh phòng họp <span className="text-red-500">*</span> <span className="text-slate-400 text-xs font-normal">(JPG/PNG/WEBP/GIF, tối đa 5MB)</span>
          </Label>
          <div className="mt-1.5 space-y-3">
            {preview && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="text-sm font-medium text-slate-700">
                    {room?.image && formData.image === room.image 
                      ? 'Ảnh hiện tại:' 
                      : 'Ảnh mới đã chọn:'}
                  </p>
                </div>
                <div className="relative w-full max-w-md rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
                  <img
                    src={preview}
                    alt="Room preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {room?.image && formData.image === room.image && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow">
                        Ảnh gốc
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                        // Reset input file
                        document.getElementById('image').value = '';
                      }}
                      className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 focus:outline-none shadow-lg transition-all"
                      title="Xóa ảnh"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="w-full border-slate-300 focus:ring-slate-900"
              />
            </div>
            {!preview && (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Bắt buộc: Vui lòng chọn ảnh cho phòng họp (JPG, PNG, WEBP, GIF - tối đa 5MB)
              </p>
            )}
          </div>
        </div>

        {/* Hiển thị trạng thái mặc định */}
        <div className="flex items-center bg-green-50 p-3 rounded-md border border-green-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-2 text-sm text-green-700">
            Phòng sẽ được tạo với trạng thái "Có sẵn"
          </span>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-w-[100px]"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          className="min-w-[100px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : room ? 'Cập nhật' : 'Tạo phòng'}
        </Button>
      </div>
    </form>
  );
};

export default RoomForm;
