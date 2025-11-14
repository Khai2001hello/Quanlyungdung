import { useState } from 'react';
import { Card, Button } from './ui';
import RoomForm from './RoomForm';
import { createRoom, updateRoom, deleteRoom } from '../api/rooms';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const AdminRoomManager = ({ rooms, onUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { user } = useAuth();

  const handleCreateRoom = async (data) => {
    try {
      await createRoom(data);
      setIsFormOpen(false);
      onUpdate();
    } catch (error) {
      toast.error('Error creating room');
    }
  };

  const handleUpdateRoom = async (data) => {
    try {
      await updateRoom(selectedRoom._id, data);
      setSelectedRoom(null);
      onUpdate();
    } catch (error) {
      toast.error('Error updating room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await deleteRoom(roomId);
      onUpdate();
      toast.success('Room deleted successfully');
    } catch (error) {
      toast.error('Error deleting room');
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => {
            setSelectedRoom(null);
            setIsFormOpen(true);
          }}
        >
          Add New Room
        </Button>
      </div>

      {(isFormOpen || selectedRoom) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <RoomForm
              room={selectedRoom}
              onSubmit={selectedRoom ? handleUpdateRoom : handleCreateRoom}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedRoom(null);
              }}
            />
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room._id} className="p-4">
            <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
            <p className="text-gray-600 mb-4">{room.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Capacity: {room.capacity}
              </span>
              <div className="space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedRoom(room)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteRoom(room._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminRoomManager;