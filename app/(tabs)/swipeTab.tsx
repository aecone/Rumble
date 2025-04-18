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
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as emoji from 'node-emoji';
import { get, find, search, emojify } from 'node-emoji';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Type definitions remain the same
type UserCard = {
  id: string;
  firstName: string;
  lastName: string
  userType: string;
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

interface FilterOptions {
  gradYear?: string;
  major?: string;
  ethnicity?: string;
  gender?: string;
  interestedIndustries?: string[];
  mentorshipAreas?: string[];
  orgs?: string[];
  hobbies?: string[];
  careerPath?: string[];
  userType?: string;
  [key: string]: any;
}



export default function SwipeTab() {
  const { width: screenWidth } = useWindowDimensions();
  const [users, setUsers] = useState<UserCard[]>([]);
  const router = useRouter();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(false);

  const dynamicStyles = StyleSheet.create({
    profileImage: {
      width: screenWidth * 0.65,
      //maxWidth: screenWidth * 0.35,
      //maxHeight: screenWidth * 0.35,
      height: screenWidth * 0.65,
      borderRadius: screenWidth * 0.325,
      padding: screenWidth * 0.04,
    },
    profileImagePlaceholder: {
      width: screenWidth * 0.65,
      height: screenWidth * 0.65,
      //maxWidth: screenWidth * 0.35,
      //maxHeight: screenWidth * 0.35,
      aspectRatio: 1,
      borderRadius: 20,
      backgroundColor: '#4A474C',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#FFF',
      //padding: screenWidth * 0.04,
    }
  });
  

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

  // Keep original functionality but update the UI rendering
  useFocusEffect(
    React.useCallback(() => {
      const loadSavedFilters = async () => {
        try {
          setIsLoading(true);
          const savedFilters = await AsyncStorage.getItem('userFilters');
          let parsedFilters: FilterOptions = {};
          
          if (savedFilters) {
            parsedFilters = JSON.parse(savedFilters) as FilterOptions;
            console.log("Loaded saved filters:", parsedFilters);
          }
          
          const currentUser = auth.currentUser;
          if (currentUser) {
            const token = await currentUser.getIdToken(true);
            const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
              method: "GET",
              headers: {
                Authorization: token,
              },
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const currentUserType = profileData.profile?.userType || '';
              
              if (currentUserType === 'mentor') {
                parsedFilters.userType = 'mentee';
              } else if (currentUserType === 'mentee') {
                parsedFilters.userType = 'mentor';
              }
              
              await AsyncStorage.setItem('userFilters', JSON.stringify(parsedFilters));
            }
          }
          
          setFilters(parsedFilters);
          await fetchSuggestedUsers(parsedFilters);
        } catch (error) {
          console.error('Failed to load filters:', error);
          await fetchSuggestedUsers({});
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSavedFilters();
    }, [])
  );

  const navigateToFilters = () => {
    router.push({
      pathname: '/filtering',
      params: { currentFilters: JSON.stringify(filters) }
    });
  };

  const transformFiltersForAPI = (frontendFilters: FilterOptions) => {
    return {
      major: frontendFilters.major || "",
      gradYear: frontendFilters.gradYear ? parseInt(frontendFilters.gradYear) : undefined,
      ethnicity: frontendFilters.ethnicity || "",
      gender: frontendFilters.gender || "",
      hobbies: frontendFilters.hobbies || [],
      orgs: frontendFilters.orgs || [],
      careerPath: Array.isArray(frontendFilters.careerPath) 
        ? frontendFilters.careerPath 
        : (frontendFilters.careerPath ? [frontendFilters.careerPath] : []),
      interestedIndustries: frontendFilters.interestedIndustries || [],
      mentorshipAreas: frontendFilters.mentorshipAreas || [],
      userType: frontendFilters.userType || "",
    };
  };

  const fetchSuggestedUsers = async (newFilters: FilterOptions = {}) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in.');
        return;
      }
      
      const apiFilters = transformFiltersForAPI(newFilters);
      console.log("Sending filters to API:", apiFilters);
  
      const token = await currentUser.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/suggested_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(apiFilters),
      });
    
      const data = await response.json();
      console.log("API Response users:", data.users?.length || 0);
  
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        Alert.alert('Error', data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Could not load users.');
    }
  };

  // Animation handlers remain the same
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
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
    console.log(`Swiped ${direction} on item:`, item?.id);
    
    if (direction === 'right' && item) {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
  
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

  // Updated card rendering to include scrollable content
  const renderCards = () => {
    if (isLoading) {
      return (
        <View style={styles.noMoreCardsContainer}>
          <Text style={styles.empty}>Loading users...</Text>
        </View>
      );
    }
    
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
                <Text style={styles.likeText}>CONNECT</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.dislikeContainer,
                  { opacity: dislikeOpacity }
                ]}
              >
                <Text style={styles.dislikeText}>NOPE</Text>
              </Animated.View>
              
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileSection}>
                    {user.profilePictureUrl ? (
                      <Image
                        source={{ uri: user.profilePictureUrl }}
                        style={dynamicStyles.profileImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={dynamicStyles.profileImagePlaceholder}>
                        <Text style={styles.placeholderText}>
                          {user.firstName.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.nameSection}>
                  <Text style={styles.name}>
                    {user.firstName} {user.lastName}
                  </Text>
                  {user.pronouns && (
                    <View style={styles.pronounsTag}>
                      <Text style={styles.pronounsText}>{user.pronouns}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.sectionContainer}>
                  <View style={styles.aboutMeBox}>
                  <Text style={styles.sectionTitle}>About Me</Text>
                    <Text style={styles.bioText}>
                      {user.bio || `Hi! I'm ${user.firstName} and I am looking to ${user.userType === 'mentor' ? 'mentee' : 'mentor'} with similar career aspirations, hobbies, and interests`}
                    </Text>
                  </View>
                </View>

                {user.major && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.infoBox}>
                    <Text style={styles.sectionTitle}>Education</Text>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Major: </Text>
                        {user.major}
                      </Text>
                      {user.gradYear && (
                        <Text style={styles.infoText}>
                          <Text style={styles.infoLabel}>Expected Graduation: </Text>
                          {user.gradYear}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {user.orgs && user.orgs.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Organizations</Text>
                    <View style={styles.tagsContainer}>
                      {user.orgs.map((org, idx) => (
                        <View key={idx} style={styles.orgTag}>
                          <Text style={styles.orgText}>🏢 {org}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {user.careerPath && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Career Path</Text>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>{user.careerPath}</Text>
                    </View>
                  </View>
                )}

                {user.interestedIndustries && user.interestedIndustries.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Industries of Interest</Text>
                    <View style={styles.tagsContainer}>
                      {user.interestedIndustries.map((industry, idx) => (
                        <View key={idx} style={styles.industryTag}>
                          <Text style={styles.industryText}>{industry}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Mentorship Areas</Text>
                  <View style={styles.tagsContainer}>
                    {user.mentorshipAreas && user.mentorshipAreas.length > 0 ? (
                      user.mentorshipAreas.map((area, idx) => (
                        <View key={idx} style={styles.mentorshipTag}>
                          <Text style={styles.mentorshipText}>{area}</Text>
                        </View>
                      ))
                    ) : (
                      <>
                        <View style={styles.mentorshipTag}>
                          <Text style={styles.mentorshipText}>Professional Development</Text>
                        </View>
                        <View style={styles.mentorshipTag}>
                          <Text style={styles.mentorshipText}>Friendship</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
                  <View style={styles.tagsContainer}>
                    {user.hobbies && user.hobbies.length > 0 ? (
                      user.hobbies.map((hobby, idx) => (
                        <View key={idx} style={styles.interestTag}>
                          <Text style={styles.interestText}>
                            {getEmojiForInterest(hobby)} {hobby}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <>
                        <View style={styles.interestTag}>
                          <Text style={styles.interestText}>None Listed</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
                
                {/* Add padding at the bottom for better scrolling */}
                <View style={styles.bottomPadding} />
              </ScrollView>
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
            {/* Next card preview - keeping empty for background card effect */}
          </Animated.View>
        );
      }
      
      return null;
    }).reverse();
  };

//emoji for interests
  const getEmojiForInterest = (interest: string): string => {
    const DEFAULT_EMOJI = '🌟';
    if (!interest?.trim()) return DEFAULT_EMOJI;
    const lowerInterest = interest.toLowerCase().trim();
    return [
      // Direct get
      () => {
        const result = get(lowerInterest);
        return result !== lowerInterest ? result : undefined;
      },
      () => find(lowerInterest)?.emoji,
      () => search(lowerInterest)[0]?.emoji
    ].reduce<string>(
      (result, getter) => result || getter() || '',
      ''
    ) || DEFAULT_EMOJI;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text key="bold" style={styles.title}>Swipe</Text>
          <Text style={styles.title2}>Connect</Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={navigateToFilters}
          >
            <Ionicons name="filter" size={30} color="EDEDEDF" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          {renderCards()}
        </View>
          
        {users.length > 0 && (
          <View style={styles.cardActionButtons}>
            <TouchableOpacity onPress={handleManualSkip} style={styles.skipButton}>
              <Text style={styles.actionButtonText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleManualSwipeRight} style={styles.likeButton}>
              <Text style={styles.actionButtonText}>✓</Text>
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
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    position: 'relative',
  },
  title: {
    fontSize: Math.min(SCREEN_WIDTH * 0.07, 28),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  title2: {
    fontSize: Math.min(SCREEN_WIDTH * 0.07, 28),
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
  },
  filterButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#EDEDED',
    padding: 12,
    borderRadius: 30,
    elevation: 3,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 60,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.92,
    height: SCREEN_HEIGHT * 0.77,
    borderRadius: 30,
    backgroundColor: '#F9F5F2',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    padding: 0,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  nameSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  pronounsTag: {
    backgroundColor: '#E6DFF1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginTop: 8,
  },
  pronounsText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    padding: 15,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  aboutMeBox: {
    backgroundColor: '#E0F2F1',
    padding: 14,
    borderRadius: 20,
  },
  bioText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  interestTag: {
    backgroundColor: '#FCE4EC',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#333',
  },
  mentorshipTag: {
    backgroundColor: '#E8EAF6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  mentorshipText: {
    fontSize: 14,
    color: '#333',
  },
  orgTag: {
    backgroundColor: '#F3E5F5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  orgText: {
    fontSize: 14,
    color: '#333',
  },
  industryTag: {
    backgroundColor: '#FCE4EC',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  industryText: {
    fontSize: 14,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
  cardActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
    marginTop: 10,
  },
  skipButton: {
    backgroundColor: '#4A474C',
    width: 80,
    height: 80,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: '#4A474C',
    width: 80,
    height: 80,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    elevation: 5,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '400',
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
    fontSize: 32,
    fontWeight: 'bold',
    padding: 8,
    // textShadowColor: 'rgba(0, 0, 0, 0.2)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 1,
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
    fontSize: 32,
    fontWeight: 'bold',
    padding: 8,
    // textShadowColor: 'rgba(0, 0, 0, 0.2)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 1,
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 18,
    color: '#888',
  },
});