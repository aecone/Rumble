/*
Swiping functionality, including left and right gesture swiping and buttons. Includes navigation to filtering
*/
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { get, find, search, emojify } from 'node-emoji';
import DropDownPicker from 'react-native-dropdown-picker';

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

//Types of filters
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


// Export function for the swiping, incluidng dynamic pfp styles, swipe animation, and API calls to handle swipes
export default function SwipeTab() {
  const { width: screenWidth } = useWindowDimensions();
  const [users, setUsers] = useState<UserCard[]>([]);
  const router = useRouter();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(false);

  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserCard | null>(null);
  const popupAnimation = useRef(new Animated.Value(0)).current;

  const dynamicStyles = StyleSheet.create({
    profileImage: {
      width: screenWidth * 0.6,
      //maxWidth: screenWidth * 0.35,
      //maxHeight: screenWidth * 0.35,
      height: screenWidth * 0.6,
      borderRadius: screenWidth * 0.325,
      padding: screenWidth * 0.04,
    },
    profileImagePlaceholder: {
      width: 300,
      height: 300,
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

  useFocusEffect(
    React.useCallback(() => {
      const loadSavedFilters = async () => {
        try {
          setIsLoading(true);
          const savedFilters = await AsyncStorage.getItem('userFilters');
          let parsedFilters: FilterOptions = {};
          
          // If no saved filters, start fresh
          if (!savedFilters) {
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
                
                // Set default userType filter based on current user
                if (currentUserType === 'mentor') {
                  parsedFilters.userType = 'mentee';
                } else if (currentUserType === 'mentee') {
                  parsedFilters.userType = 'mentor';
                }
              }
            }
          } else {
            parsedFilters = JSON.parse(savedFilters) as FilterOptions;
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
      gradYear: frontendFilters.gradYear ? parseInt(frontendFilters.gradYear) : null,
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

  const showCustomMatchPopup = (matchedUser: UserCard) => {
    setMatchedUser(matchedUser);
    setShowMatchPopup(true);
    Animated.spring(popupAnimation, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const hideMatchPopup = () => {
    Animated.timing(popupAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowMatchPopup(false);
      setMatchedUser(null);
    });
  };
  
  const navigateToMatches = () => {
    hideMatchPopup();
    // Navigate to the matches tab
    router.push('/matchesTab');
  };

  const onSwipeComplete = async (direction: string) => {
    const item = users[0];
    console.log(`Swiped ${direction} on item:`, item?.id);
    
    // Update UI immediately
    setUsers(users.slice(1));
    position.setValue({ x: 0, y: 0 });
    
    if (direction === 'right' && item) {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
  
      try {
        // First, make the swipe API call
        const token = await currentUser.getIdToken(true);
        await fetch(`${API_BASE_URL}/swipe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            swipedID: item.id,
          }),
        });
        
        // Regardless of the response, check if we're matched now
        const matchesResponse = await fetch(`${API_BASE_URL}/matches`, {
          headers: { Authorization: token },
        });
        
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          if (matchesData.matches.some((match: any) => match.id === item.id)) {
            // Use custom popup instead of Alert
            showCustomMatchPopup(item);
          }
        }
      } catch (error) {
        console.error('Swipe error:', error);
      }
    }
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
                          <Text style={styles.mentorshipText}>None listed</Text>
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
        {showMatchPopup && matchedUser && (
          <View style={styles.popupOverlay}>
            <Animated.View 
              style={[
                styles.matchPopup, 
                {
                  transform: [
                    { scale: popupAnimation },
                    { translateY: popupAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0]
                    })}
                  ],
                  opacity: popupAnimation
                }
              ]}
            >
              <View style={styles.popupContent}>
                <Text style={styles.matchTitle}> It's a Connection! </Text>
                
                <View style={styles.matchProfileSection}>
                  {matchedUser.profilePictureUrl ? (
                    <Image
                      source={{ uri: matchedUser.profilePictureUrl }}
                      style={styles.matchProfileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.matchProfilePlaceholder}>
                      <Text style={styles.matchPlaceholderText}>
                        {matchedUser.firstName.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.matchMessage}>
                  You and {matchedUser.firstName} have matched! Connect with them now.
                </Text>
                
                <View style={styles.popupButtons}>
                  <TouchableOpacity 
                    style={styles.laterButton}
                    onPress={hideMatchPopup}
                  >
                    <Text style={styles.laterButtonText}>Later</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.chatButton}
                    onPress={navigateToMatches}
                  >
                    <Text style={styles.chatButtonText}>Go to Matches</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Styles
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
    paddingTop: 20,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.75,
    borderRadius: 30,
    backgroundColor: '#F9F5F2',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    paddingBottom: -50,
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
    marginTop: -30,
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
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchPopup: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  popupContent: {
    width: '100%',
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchProfileSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  matchProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#C0DEDD',
  },
  matchProfilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A474C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#C0DEDD',
  },
  matchPlaceholderText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  matchMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  popupButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  laterButton: {
    backgroundColor: '#EDEDED',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#4A474C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
    flex: 1.5,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});