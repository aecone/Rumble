import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { auth, API_BASE_URL } from "../../FirebaseConfig";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type UserCard = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  birthday?: string;
  ethnicity?: string;
  gender?: string;
  pronouns?: string;
  bio?: string;
  profilePictureUrl?: string;
  major?: string;
  gradYear?: number;
  hobbies?: string[];
  orgs?: string[];
  careerPath?: string;
  interestedIndustries?: string[];
  mentorshipAreas?: string[];
};


export default function SwipeTab() {
  const [users, setUsers] = useState<UserCard[]>([]);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.5, 1],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async (filters = {}) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in.');
        return;
      }

      
      const token = await currentUser.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/suggested_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // ← if using Firebase Auth
        },
        body: JSON.stringify(filters), // can be empty
      });
    
      const data = await response.json();
      console.log(data.users);

      if (response.ok) {
        setUsers(data.users);
      } else {
        Alert.alert('Error', data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not load users.');
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === 4) {
      const swipe = event.nativeEvent.translationX;
      
      if (swipe > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (swipe < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else {
        resetPosition();
      }
    }
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => onSwipeComplete('left'));
  };

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => onSwipeComplete('right'));
  };

  const onSwipeComplete = async (direction: string) => {
    const item = users[0];
    console.log(`Swiped ${direction} on item:`, item);
    
    if (direction === 'right') {
      // Handle the like logic (previously handleSwipeRight)
      const currentUser = auth.currentUser;
      if (!currentUser || !item) return;
  
      try {
        const token = await currentUser.getIdToken(true);
  
        const response = await fetch(`${API_BASE_URL}/swipe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            swipedID: item.id,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          if (data.match) {
            Alert.alert("🎉 It's a Match!", `You matched with ${item.firstName}`);
          }
        } else {
          Alert.alert('Error', data.error || 'Swipe failed');
        }
      } catch (error) {
        console.error('Swipe error:', error);
        Alert.alert('Error', 'Swipe failed.');
      }
    }
    
    // Remove the first card and reset position
    setUsers(users.slice(1));
    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  const handleManualSwipeRight = () => {
    swipeRight();
  };

  const handleManualSkip = () => {
    swipeLeft();
  };

  const renderCards = () => {
    if (users.length === 0) {
      return (
        <View style={styles.noMoreCardsContainer}>
          <Text style={styles.empty}>No more users to swipe on.</Text>
        </View>
      );
    }

    return users.map((user, index) => {
      if (index === 0) {
        return (
          <PanGestureHandler
            key={user.id}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate: rotate }
                  ]
                }
              ]}
            >
              <Animated.View
                style={[
                  styles.likeContainer,
                  { opacity: likeOpacity }
                ]}
              >
                <Text style={styles.likeText}>LIKE</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.dislikeContainer,
                  { opacity: dislikeOpacity }
                ]}
              >
                <Text style={styles.dislikeText}>NOPE</Text>
              </Animated.View>
              
              {user.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.placeholderText}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={styles.name}>{user.firstName} {user.lastName} | {user.pronouns}</Text>
              <Text style={styles.info}>{user.major} major</Text>
              <Text style={styles.info}>Class of {user.gradYear}</Text>
              <Text style={styles.info}>{user.bio}</Text>
              <Text style={styles.info}>{user.ethnicity}</Text>
              <Text style={styles.info}>Organizations: {Array.isArray(user.orgs) ? user.orgs.join(', ') : user.orgs}</Text>
              <Text style={styles.info}>Can mentor in: {Array.isArray(user.mentorshipAreas) ? user.mentorshipAreas.join(', ') : user.mentorshipAreas}</Text>
              <Text style={styles.info}>Hobbies: {Array.isArray(user.hobbies) ? user.hobbies.join(', ') : user.hobbies}</Text>
              
              
            </Animated.View>
          </PanGestureHandler>
        );
      }

      if (index === 1) {
        return (
          <Animated.View
            key={user.id}
            style={[
              styles.card,
              {
                opacity: nextCardOpacity,
                transform: [{ scale: nextCardScale }],
                zIndex: -index
              }
            ]}
          >
          </Animated.View>
        );
      }
      
      return null;
    }).reverse();
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Swipe Stack</Text>
        <View style={styles.cardsContainer}>
          {renderCards()}
        </View>
          
        {users.length > 0 && (
          <View style={styles.cardActionButtons}>
          <TouchableOpacity onPress={handleManualSkip} style={styles.likeButton}>
            <Text style={styles.likeButtonText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleManualSwipeRight} style={styles.likeButton}>
            <Text style={styles.likeButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#FAFAFA',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: '600',
    marginBottom: 20,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    position: 'absolute',
    width: '80%',
    height: '90%',
    padding: 20,
    paddingTop: 45,
    paddingBottom: 80,
    borderRadius: 40,
    backgroundColor: '#F9F5F2',
    elevation: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 20
  },
  profileImage: {
    width: 550,
    height: 550,
    borderRadius: 45,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 550,
    height: 550,
    borderRadius: 45,
    backgroundColor: '#534E5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  scrollContainer: {
    width: '100%',
    marginTop: 10,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 35,
    color: '#444',
    marginBottom: 6,
    alignItems: 'center',
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  skipButton: {
    backgroundColor: '#E57373',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  empty: {
    fontSize: 18,
    marginTop: 50,
    color: '#888',
  },
  likeButton: {
    backgroundColor: '#534E5B',
    width: 110,
    height: 110,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 30

  },
  likeButtonText: {
    color: '#FFF',
    fontSize: 45,
    fontWeight: '700',
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    transform: [{ rotate: '-20deg' }],
    zIndex: 1000,
  },
  likeText: {
    color: '#C0DEDD',
    fontSize: 45,
    fontWeight: 'bold',
    padding: 8,
  },
  dislikeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    transform: [{ rotate: '20deg' }],
    zIndex: 1000,
  },
  dislikeText: {
    color: '#F1DFDE',
    fontSize: 45,
    fontWeight: 'bold',
    padding: 8,
  },
  cardActionButtons: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 300,
  },
});