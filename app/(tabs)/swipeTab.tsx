import { StyleSheet, Text, SafeAreaView, View, Dimensions, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function TabTwoScreen() {
  const [cards, setCards] = useState<any>([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const todosCollection = collection(db, 'todos');

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
    fetchCards();
  }, [user]);

  const fetchCards = async () => {
    if (user) {
      const q = query(todosCollection, where("userId", "==", user.uid));
      const data = await getDocs(q);
      setCards(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      
      // If there are no cards, add some dummy cards for demonstration
      if (data.docs.length === 0) {
        setCards([
          { id: '1', task: 'Card 1' },
          { id: '2', task: 'Card 2' },
          { id: '3', task: 'Card 3' },
          { id: '4', task: 'Card 4' },
          { id: '5', task: 'Card 5' },
        ]);
      }
    } else {
      console.log("No user logged in");
      // Add some dummy cards for demonstration when no user is logged in
      setCards([
        { id: '1', task: 'Card 1' },
        { id: '2', task: 'Card 2' },
        { id: '3', task: 'Card 3' },
        { id: '4', task: 'Card 4' },
        { id: '5', task: 'Card 5' },
      ]);
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

  const onSwipeComplete = (direction: string) => {
    const item = cards[0];
    console.log(`Swiped ${direction} on item:`, item);
    
    // Remove the first card and reset position
    setCards(cards.slice(1));
    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  const renderCards = () => {
    if (cards.length === 0) {
      return (
        <View style={styles.noMoreCardsContainer}>
          <Text style={styles.noMoreCardsText}>No more cards!</Text>
        </View>
      );
    }

    return cards.map((item: any, index: number) => {
      if (index === 0) {
        return (
          <PanGestureHandler
            key={item.id}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.cardStyle,
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
              
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>{item.task || 'Blank Card'}</Text>
              </View>
            </Animated.View>
          </PanGestureHandler>
        );
      }

      if (index === 1) {
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardStyle,
              {
                opacity: nextCardOpacity,
                transform: [{ scale: nextCardScale }],
                zIndex: -index
              }
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>{item.task || 'Blank Card'}</Text>
            </View>
          </Animated.View>
        );
      }

      if (index < 5) {
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardStyle,
              {
                opacity: 0.8,
                transform: [{ scale: 0.9 }],
                zIndex: -index
              }
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>{item.task || 'Blank Card'}</Text>
            </View>
          </Animated.View>
        );
      }
      
      return null;
    }).reverse();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.mainTitle}>Card Swiper</Text>
          <View style={styles.cardsContainer}>
            {renderCards()}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1 
  },
  container: { 
    flex: 1, 
    padding: 20 
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333',
    textAlign: 'center'
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.4,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  cardText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  likeContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    transform: [{ rotate: '-20deg' }],
    zIndex: 1000,
  },
  likeText: {
    borderWidth: 3,
    borderColor: '#4CAF50',
    color: '#4CAF50',
    fontSize: 28,
    fontWeight: 'bold',
    padding: 10,
  },
  dislikeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    transform: [{ rotate: '20deg' }],
    zIndex: 1000,
  },
  dislikeText: {
    borderWidth: 3,
    borderColor: '#F44336',
    color: '#F44336',
    fontSize: 28,
    fontWeight: 'bold',
    padding: 10,
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreCardsText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
});