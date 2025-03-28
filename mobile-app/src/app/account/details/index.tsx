import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '../../../store/auth-store';
import { makeApiCall, API_ENDPOINTS } from '../../../utils/api-config';
import EditUserDetails from '../../../components/edit-user-details';

export default function MyDetailsScreen() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserDetails();
    }
  }, [isAuthenticated, user]);

  const fetchUserDetails = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Make sure to use the correct endpoint constant from API_ENDPOINTS
      const response = await makeApiCall(API_ENDPOINTS.updateProfile, {
        method: 'POST',
        data: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          telephone: user.telephone || '',
        }
      });
      
      if (response.success === 1 && response.data) {
        setUserDetails(response.data);
      } else {
        throw new Error(Array.isArray(response.error) ? response.error[0] : 'Failed to fetch user details');
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComplete = async (updatedData: any) => {
    try {
      setIsLoading(true);
      await updateUser({
        firstname: updatedData.firstname,
        lastname: updatedData.lastname,
        email: updatedData.email,
        telephone: updatedData.telephone
      });
      
      // Refresh user details after update
      await fetchUserDetails();
      setIsEditing(false);
      Alert.alert('Success', 'Your details have been updated successfully.');
    } catch (error: any) {
      console.error('Error updating user details:', error);
      Alert.alert('Error', error.message || 'Failed to update user details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isEditing) {
    return (
      <EditUserDetails 
        userData={userDetails || user} 
        onCancel={() => setIsEditing(false)}
        onSubmit={handleEditComplete}
      />
    );
  }

  const displayData = userDetails || user;
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'MY DETAILS' }} />
      
      <View style={styles.fieldsContainer}>
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <TextInput
            style={styles.textInput}
            value={`${displayData?.firstname} ${displayData?.lastname}`}
            editable={false}
          />
        </View>
        
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <TextInput
            style={styles.textInput}
            value={displayData?.email}
            editable={false}
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
          <TextInput
            style={styles.textInput}
            value={displayData?.telephone}
            editable={false}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            style={styles.textInput}
            value="********"
            editable={false}
            secureTextEntry
          />
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => setIsEditing(true)}
      >
        <Text style={styles.editButtonText}>EDIT DETAILS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000',
  },
  fieldsContainer: {
    padding: 20,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  editButton: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 