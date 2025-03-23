import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth-store';
import EditUserDetails from '../../../components/edit-user-details';

export default function MyDetailsScreen() {
  const { user } = useAuthStore();
  const [showEditModal, setShowEditModal] = React.useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'MY DETAILS',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
        }}
      />

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.value}>{user?.fullName || 'Ahmed Enzi'}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.value}>{user?.email || 'ahmed@gmail.com'}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.value}>{user?.mobileNumber || '991122334'}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.value}>********</Text>
        </View>

        <Pressable 
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={20} color="black" />
          <Text style={styles.editButtonText}>EDIT DETAILS?</Text>
        </Pressable>
      </View>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <EditUserDetails onClose={() => setShowEditModal(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    backgroundColor: '#fff',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#000',
  },
}); 