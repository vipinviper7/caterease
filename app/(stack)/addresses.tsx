import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MapPin, Trash2, X } from 'lucide-react-native';
import { Text, Card, Button, Input, EmptyState } from '@/src/components/ui';
import { COLORS } from '@/src/utils/constants';
import { Address } from '@/src/types/database';

// Local state for demo mode
let localAddresses: Address[] = [];
let nextId = 1;

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>(localAddresses);
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const handleAdd = () => {
    if (!label || !fullAddress || !city || !pincode) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    const newAddr: Address = {
      id: `addr-${nextId++}`,
      user_id: 'local-user',
      label,
      full_address: fullAddress,
      city,
      pincode,
      lat: null,
      lng: null,
      is_default: addresses.length === 0,
      created_at: new Date().toISOString(),
    };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    localAddresses = updated;
    resetForm();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = addresses.filter(a => a.id !== id);
          setAddresses(updated);
          localAddresses = updated;
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, is_default: a.id === id }));
    setAddresses(updated);
    localAddresses = updated;
  };

  const resetForm = () => {
    setLabel('');
    setFullAddress('');
    setCity('');
    setPincode('');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {addresses.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} color={COLORS.neutral300} />}
            title="No saved addresses"
            description="Add your frequently used addresses for quick booking."
            actionLabel="Add Address"
            onAction={() => setShowModal(true)}
          />
        ) : (
          addresses.map((addr) => (
            <Card key={addr.id} variant="outlined" className="p-4 mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text variant="body-sm" weight="semibold">{addr.label}</Text>
                    {addr.is_default && (
                      <View className="bg-primary-light px-2 py-0.5 rounded-chip ml-2">
                        <Text variant="caption" weight="medium" className="text-primary">Default</Text>
                      </View>
                    )}
                  </View>
                  <Text variant="body-sm" className="text-neutral-600">{addr.full_address}</Text>
                  <Text variant="caption" className="text-neutral-400 mt-1">{addr.city} - {addr.pincode}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(addr.id)} className="p-2">
                  <Trash2 size={18} color={COLORS.neutral400} />
                </TouchableOpacity>
              </View>
              {!addr.is_default && (
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)} className="mt-2">
                  <Text variant="caption" weight="medium" className="text-primary">Set as default</Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      {addresses.length > 0 && (
        <View className="px-4 pb-6">
          <Button
            title="Add New Address"
            icon={<Plus size={18} color="#fff" />}
            onPress={() => setShowModal(true)}
            size="lg"
          />
        </View>
      )}

      {/* Add Address Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-4 border-b border-neutral-100">
            <Text variant="h3" weight="bold">Add Address</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <X size={24} color={COLORS.neutral700} />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-4 pt-4">
            <Input label="Label" placeholder="e.g. Home, Office, Farm House" value={label} onChangeText={setLabel} className="mb-4" />
            <Input label="Full Address" placeholder="Street, area, landmark" value={fullAddress} onChangeText={setFullAddress} multiline numberOfLines={3} className="mb-4" />
            <Input label="City" placeholder="City" value={city} onChangeText={setCity} className="mb-4" />
            <Input label="Pincode" placeholder="6-digit pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} className="mb-6" />
            <Button title="Save Address" onPress={handleAdd} size="lg" className="mb-8" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
