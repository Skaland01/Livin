import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useHousehold } from '../../hooks/useHousehold';
import { roomPresets, RoomPreset } from '../../lib/presets';
import { roomSchema, RoomForm } from '../../lib/validation';
import { RootStackParamList } from '../../lib/types';

type RoomsEditorNavigationProp = StackNavigationProp<RootStackParamList, 'RoomsEditor'>;

const ROOM_PRESETS: { value: RoomPreset; label: string; icon: string }[] = [
  { value: 'Bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'Kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'LivingRoom', label: 'Living Room', icon: '🛋️' },
  { value: 'Hallway', label: 'Hallway', icon: '🚪' },
  { value: 'Custom', label: 'Custom', icon: '⚙️' },
];

const CLEANING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', description: 'Clean once per week' },
  { value: 'biweekly', label: 'Every 2 weeks', description: 'Clean every other week' },
  { value: 'monthly', label: 'Monthly', description: 'Clean once per month' },
  { value: 'custom', label: 'Custom', description: 'Set your own schedule' },
];

interface TaskItemProps {
  task: string;
  index: number;
  isPresetTask: boolean;
  onEdit: (index: number, task: string) => void;
  onDelete: (index: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  isPresetTask,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task);

  const handleEdit = () => {
    if (editText.trim() && editText !== task) {
      onEdit(index, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(task);
    setIsEditing(false);
  };

  return (
    <View style={{ marginBottom: tokens.spacing.sm }}>
      {isEditing ? (
        <View style={{ flexDirection: 'row', gap: tokens.spacing.sm }}>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            style={{
              flex: 1,
              backgroundColor: colors.dark.bg,
              borderRadius: tokens.borderRadius.sm,
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: tokens.spacing.xs,
              color: colors.dark.textPrimary,
              fontSize: tokens.typography.sizes.sm,
              borderWidth: 1,
              borderColor: colors.dark.border,
            }}
            autoFocus
          />
          <TouchableOpacity
            onPress={handleEdit}
            style={{
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: tokens.spacing.xs,
              backgroundColor: colors.dark.accent,
              borderRadius: tokens.borderRadius.sm,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: colors.dark.bg, 
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.medium,
            }}>
              Save
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancelEdit}
            style={{
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: tokens.spacing.xs,
              backgroundColor: colors.dark.textSecondary,
              borderRadius: tokens.borderRadius.sm,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: colors.dark.bg, 
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.medium,
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: tokens.spacing.sm,
          backgroundColor: isPresetTask 
            ? colors.dark.input 
            : colors.dark.accent + '20',
          borderRadius: tokens.borderRadius.sm,
          borderWidth: isPresetTask ? 0 : 1,
          borderColor: isPresetTask ? 'transparent' : colors.dark.accent + '40',
        }}>
          <Text style={{
            flex: 1,
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes.sm,
          }}>
            {task}
          </Text>
          {isPresetTask && (
            <Text style={{
              color: colors.dark.textSecondary,
              fontSize: tokens.typography.sizes.xs,
              fontStyle: 'italic',
            }}>
              Preset
            </Text>
          )}
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={{
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: tokens.spacing.xs,
              backgroundColor: colors.dark.accent,
              borderRadius: tokens.borderRadius.sm,
            }}
          >
            <Text style={{
              color: colors.dark.bg,
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.medium,
            }}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(index)}
            style={{
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: tokens.spacing.xs,
              backgroundColor: colors.dark.error,
              borderRadius: tokens.borderRadius.sm,
            }}
          >
            <Text style={{
              color: colors.dark.bg,
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.medium,
            }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const RoomsEditorScreen: React.FC = () => {
  console.log('RoomsEditorScreen rendered');
  const navigation = useNavigation<RoomsEditorNavigationProp>();
  const { rooms, addRoom, updateRoom, deleteRoom, loading } = useHousehold();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [formData, setFormData] = useState<RoomForm>({
    name: '',
    preset: 'Bathroom',
    customTasks: [],
  });
  
  const [errors, setErrors] = useState<Partial<RoomForm>>({});
  const [newCustomTask, setNewCustomTask] = useState('');
  const [cleaningFrequency, setCleaningFrequency] = useState('weekly');
  const [customFrequency, setCustomFrequency] = useState('7');
  const [editingTasks, setEditingTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState('');

  const validateForm = (): boolean => {
    try {
      roomSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Partial<RoomForm> = {};
      error.issues?.forEach((err: any) => {
        newErrors[err.path[0] as keyof RoomForm] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Prepare room data, only including defined values
      const roomData: any = {
        name: formData.name,
        preset: formData.preset,
        cleaningFrequency,
      };

      // Only add customTasks if there are tasks
      if (editingTasks.length > 0) {
        roomData.customTasks = editingTasks;
      }

      // Only add customFrequency if cleaningFrequency is 'custom' and customFrequency is not empty
      if (cleaningFrequency === 'custom' && customFrequency && customFrequency.trim()) {
        roomData.customFrequency = customFrequency;
      }

      if (editingRoom) {
        // Update existing room
        await updateRoom(editingRoom.id, roomData);
        Alert.alert(
          'Success!',
          `Room "${formData.name}" has been updated successfully.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                setEditingRoom(null);
                setShowAddForm(false);
                resetForm();
              },
            },
          ]
        );
      } else {
        // Add new room
        await addRoom(
          formData.name, 
          formData.preset, 
          editingTasks.length > 0 ? editingTasks : undefined, 
          cleaningFrequency, 
          cleaningFrequency === 'custom' && customFrequency && customFrequency.trim() ? customFrequency : undefined
        );
        Alert.alert(
          'Success!',
          `Room "${formData.name}" has been added successfully.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                setShowAddForm(false);
                resetForm();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save room. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      preset: 'Bathroom',
      customTasks: [],
    });
    setErrors({});
    setNewCustomTask('');
    setCleaningFrequency('weekly');
    setCustomFrequency('7');
    setEditingTasks([]);
    setNewTask('');
  };

  const startEditing = (room: any) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      preset: room.preset,
      customTasks: room.customTasks || [],
    });
    setCleaningFrequency(room.cleaningFrequency || 'weekly');
    setCustomFrequency(room.customFrequency || '7');
    
    // Initialize editing tasks with existing custom tasks and preset tasks
    let initialTasks: string[] = [];
    
    if (room.customTasks && room.customTasks.length > 0) {
      // If room has custom tasks, use those
      initialTasks = [...room.customTasks];
    } else if (room.preset !== 'Custom' && roomPresets[room.preset]) {
      // If no custom tasks but preset exists, use preset tasks
      initialTasks = [...roomPresets[room.preset]];
    }
    
    setEditingTasks(initialTasks);
    setShowAddForm(true);
  };

  const updateForm = (field: keyof RoomForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // If preset is changed, initialize editing tasks with preset tasks
    if (field === 'preset' && value !== 'Custom' && roomPresets[value]) {
      setEditingTasks([...roomPresets[value]]);
    } else if (field === 'preset' && value === 'Custom') {
      setEditingTasks([]);
    }
  };

  const addCustomTask = () => {
    if (newCustomTask.trim() && formData.preset === 'Custom') {
      updateForm('customTasks', [...(formData.customTasks || []), newCustomTask.trim()]);
      setNewCustomTask('');
    }
  };

  const removeCustomTask = (index: number) => {
    const updatedTasks = formData.customTasks?.filter((_, i) => i !== index) || [];
    updateForm('customTasks', updatedTasks);
  };

  const addEditingTask = () => {
    if (newTask.trim()) {
      setEditingTasks([...editingTasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeEditingTask = (index: number) => {
    setEditingTasks(editingTasks.filter((_, i) => i !== index));
  };

  const editEditingTask = (index: number, newTask: string) => {
    const updatedTasks = [...editingTasks];
    updatedTasks[index] = newTask;
    setEditingTasks(updatedTasks);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${roomName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoom(roomId);
              Alert.alert('Success', `Room "${roomName}" has been deleted.`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete room.');
            }
          },
        },
      ]
    );
  };

  const renderRoomItem = ({ item }: { item: any }) => (
    <Card variant="outlined" padding="md" style={{ marginBottom: tokens.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: tokens.spacing.md }}>
          <Text style={{
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.bold,
            marginBottom: tokens.spacing.xs,
          }}>
            {item.name}
          </Text>
          <Text style={{
            color: colors.dark.textSecondary,
            fontSize: tokens.typography.sizes.sm,
            marginBottom: tokens.spacing.xs,
          }}>
            {item.preset} • {item.customTasks?.length || roomPresets[item.preset]?.length || 0} tasks
          </Text>
          <Text style={{
            color: colors.dark.accent,
            fontSize: tokens.typography.sizes.sm,
          }}>
            Clean {item.cleaningFrequency === 'custom' ? `every ${item.customFrequency} days` : item.cleaningFrequency}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: tokens.spacing.sm }}>
          <TouchableOpacity
            onPress={() => startEditing(item)}
            style={{
              paddingHorizontal: tokens.spacing.md,
              paddingVertical: tokens.spacing.sm,
              backgroundColor: colors.dark.accent,
              borderRadius: tokens.borderRadius.md,
              minWidth: 60,
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: colors.dark.bg, 
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.medium,
            }}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteRoom(item.id, item.name)}
            style={{
              paddingHorizontal: tokens.spacing.md,
              paddingVertical: tokens.spacing.sm,
              backgroundColor: colors.dark.error,
              borderRadius: tokens.borderRadius.md,
              minWidth: 60,
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: colors.dark.bg, 
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.medium,
            }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.dark.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: tokens.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: tokens.spacing.xl }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.dark.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: tokens.spacing.lg,
            }}
          >
            <Text style={{ color: colors.dark.textPrimary, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          
          <Text style={{
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes['2xl'],
            fontWeight: tokens.typography.weights.bold,
            marginBottom: tokens.spacing.sm,
          }}>
            Manage Rooms
          </Text>
          
          <Text style={{
            color: colors.dark.textSecondary,
            fontSize: tokens.typography.sizes.base,
            lineHeight: 22,
          }}>
            Add and manage rooms in your household. Each room comes with preset cleaning tasks.
          </Text>
        </View>

        {/* Add Room Button */}
        {!showAddForm && (
          <Button
            title="Add New Room"
            onPress={() => setShowAddForm(true)}
            size="lg"
            style={{ marginBottom: tokens.spacing.xl }}
          />
        )}

        {/* Add/Edit Room Form */}
        {showAddForm && (
          <Card variant="elevated" padding="lg" style={{ marginBottom: tokens.spacing.xl }}>
            <View style={{ marginBottom: tokens.spacing.lg }}>
              <Text style={{
                color: colors.dark.textPrimary,
                fontSize: tokens.typography.sizes.lg,
                fontWeight: tokens.typography.weights.bold,
                marginBottom: tokens.spacing.md,
              }}>
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </Text>

              {/* Room Name */}
              <View style={{ marginBottom: tokens.spacing.lg }}>
                <Text style={{
                  color: colors.dark.textPrimary,
                  fontSize: tokens.typography.sizes.base,
                  fontWeight: tokens.typography.weights.medium,
                  marginBottom: tokens.spacing.sm,
                }}>
                  Room Name
                </Text>
                
                <TextInput
                  value={formData.name}
                  onChangeText={(value) => updateForm('name', value)}
                  placeholder="Enter room name"
                  placeholderTextColor={colors.dark.textSecondary}
                  style={{
                    backgroundColor: colors.dark.input,
                    borderRadius: tokens.borderRadius.md,
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                    color: colors.dark.textPrimary,
                    fontSize: tokens.typography.sizes.base,
                    borderWidth: 1,
                    borderColor: errors.name ? colors.dark.error : colors.dark.border,
                  }}
                />
                
                {errors.name && (
                  <Text style={{
                    color: colors.dark.error,
                    fontSize: tokens.typography.sizes.sm,
                    marginTop: tokens.spacing.sm,
                  }}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Room Preset */}
              <View style={{ marginBottom: tokens.spacing.lg }}>
                <Text style={{
                  color: colors.dark.textPrimary,
                  fontSize: tokens.typography.sizes.base,
                  fontWeight: tokens.typography.weights.medium,
                  marginBottom: tokens.spacing.sm,
                }}>
                  Room Type
                </Text>
                
                <Text style={{
                  color: colors.dark.textSecondary,
                  fontSize: tokens.typography.sizes.sm,
                  marginBottom: tokens.spacing.md,
                }}>
                  Choose a preset or create custom tasks
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
                  {ROOM_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.value}
                      onPress={() => updateForm('preset', preset.value)}
                      style={{
                        paddingHorizontal: tokens.spacing.md,
                        paddingVertical: tokens.spacing.sm,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: formData.preset === preset.value 
                          ? colors.dark.accent 
                          : colors.dark.input,
                        borderWidth: 1,
                        borderColor: formData.preset === preset.value 
                          ? colors.dark.accent 
                          : colors.dark.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: tokens.spacing.sm,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{preset.icon}</Text>
                      <Text style={{
                        color: formData.preset === preset.value 
                          ? colors.dark.bg 
                          : colors.dark.textPrimary,
                        fontSize: tokens.typography.sizes.sm,
                        fontWeight: tokens.typography.weights.medium,
                      }}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cleaning Frequency */}
              <View style={{ marginBottom: tokens.spacing.lg }}>
                <Text style={{
                  color: colors.dark.textPrimary,
                  fontSize: tokens.typography.sizes.base,
                  fontWeight: tokens.typography.weights.medium,
                  marginBottom: tokens.spacing.sm,
                }}>
                  Cleaning Frequency
                </Text>
                
                <Text style={{
                  color: colors.dark.textSecondary,
                  fontSize: tokens.typography.sizes.sm,
                  marginBottom: tokens.spacing.md,
                }}>
                  How often should this room be cleaned?
                </Text>

                <View style={{ gap: tokens.spacing.sm }}>
                  {CLEANING_FREQUENCIES.map((frequency) => (
                    <TouchableOpacity
                      key={frequency.value}
                      onPress={() => setCleaningFrequency(frequency.value)}
                      style={{
                        padding: tokens.spacing.md,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: cleaningFrequency === frequency.value 
                          ? colors.dark.accent 
                          : colors.dark.input,
                        borderWidth: 1,
                        borderColor: cleaningFrequency === frequency.value 
                          ? colors.dark.accent 
                          : colors.dark.border,
                      }}
                    >
                      <Text style={{
                        color: cleaningFrequency === frequency.value 
                          ? colors.dark.bg 
                          : colors.dark.textPrimary,
                        fontSize: tokens.typography.sizes.base,
                        fontWeight: tokens.typography.weights.medium,
                        marginBottom: tokens.spacing.xs,
                      }}>
                        {frequency.label}
                      </Text>
                      <Text style={{
                        color: cleaningFrequency === frequency.value 
                          ? colors.dark.bg 
                          : colors.dark.textSecondary,
                        fontSize: tokens.typography.sizes.sm,
                      }}>
                        {frequency.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Frequency Input */}
                {cleaningFrequency === 'custom' && (
                  <View style={{ marginTop: tokens.spacing.md }}>
                    <Text style={{
                      color: colors.dark.textPrimary,
                      fontSize: tokens.typography.sizes.sm,
                      fontWeight: tokens.typography.weights.medium,
                      marginBottom: tokens.spacing.sm,
                    }}>
                      Clean every X days
                    </Text>
                    <TextInput
                      value={customFrequency}
                      onChangeText={setCustomFrequency}
                      placeholder="7"
                      placeholderTextColor={colors.dark.textSecondary}
                      keyboardType="numeric"
                      style={{
                        backgroundColor: colors.dark.input,
                        borderRadius: tokens.borderRadius.md,
                        paddingHorizontal: tokens.spacing.md,
                        paddingVertical: tokens.spacing.md,
                        color: colors.dark.textPrimary,
                        fontSize: tokens.typography.sizes.base,
                        borderWidth: 1,
                        borderColor: colors.dark.border,
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Task Management */}
              <View style={{ marginBottom: tokens.spacing.lg }}>
                <Text style={{
                  color: colors.dark.textPrimary,
                  fontSize: tokens.typography.sizes.base,
                  fontWeight: tokens.typography.weights.medium,
                  marginBottom: tokens.spacing.sm,
                }}>
                  {formData.preset === 'Custom' ? 'Custom Tasks' : 'Tasks'}
                </Text>
                
                <Text style={{
                  color: colors.dark.textSecondary,
                  fontSize: tokens.typography.sizes.sm,
                  marginBottom: tokens.spacing.md,
                }}>
                  {formData.preset === 'Custom' 
                    ? 'Add and manage custom cleaning tasks for this room'
                    : 'Manage tasks for this room. Use the Edit and Delete buttons to modify tasks.'
                  }
                </Text>

                {/* Add New Task */}
                <View style={{ flexDirection: 'row', gap: tokens.spacing.sm, marginBottom: tokens.spacing.md }}>
                  <TextInput
                    value={newTask}
                    onChangeText={setNewTask}
                    placeholder={formData.preset === 'Custom' ? "Add a custom task" : "Add a task"}
                    placeholderTextColor={colors.dark.textSecondary}
                    style={{
                      flex: 1,
                      backgroundColor: colors.dark.input,
                      borderRadius: tokens.borderRadius.md,
                      paddingHorizontal: tokens.spacing.md,
                      paddingVertical: tokens.spacing.sm,
                      color: colors.dark.textPrimary,
                      fontSize: tokens.typography.sizes.sm,
                    }}
                  />
                  <Button
                    title="Add"
                    onPress={addEditingTask}
                    size="sm"
                    disabled={!newTask.trim()}
                  />
                </View>

                {/* Task List */}
                <View style={{ gap: tokens.spacing.sm }}>
                  {editingTasks.map((task, index) => {
                    const isPresetTask = formData.preset !== 'Custom' && 
                      roomPresets[formData.preset]?.includes(task);
                    
                    return (
                      <TaskItem
                        key={`task-${index}`}
                        task={task}
                        index={index}
                        isPresetTask={isPresetTask}
                        onEdit={editEditingTask}
                        onDelete={removeEditingTask}
                      />
                    );
                  })}
                </View>

                {/* Info about tasks */}
                {formData.preset !== 'Custom' && roomPresets[formData.preset] && editingTasks.length === 0 && (
                  <Text style={{
                    color: colors.dark.textSecondary,
                    fontSize: tokens.typography.sizes.xs,
                    fontStyle: 'italic',
                    marginTop: tokens.spacing.sm,
                  }}>
                    Add tasks above to customize this room's cleaning list
                  </Text>
                )}
              </View>

              {/* Form Actions */}
              <View style={{ flexDirection: 'row', gap: tokens.spacing.sm }}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowAddForm(false);
                    setEditingRoom(null);
                    resetForm();
                  }}
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                />
                <Button
                  title={editingRoom ? "Update Room" : "Add Room"}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!formData.name.trim()}
                  size="md"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Existing Rooms */}
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text style={{
            color: colors.dark.textPrimary,
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.bold,
            marginBottom: tokens.spacing.md,
          }}>
            Your Rooms ({rooms.length})
          </Text>

          {rooms.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <Text style={{
                color: colors.dark.textSecondary,
                fontSize: tokens.typography.sizes.base,
                textAlign: 'center',
              }}>
                No rooms added yet. Add your first room to get started!
              </Text>
            </Card>
          ) : (
            <FlatList
              data={rooms}
              renderItem={renderRoomItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
