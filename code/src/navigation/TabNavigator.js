import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import QuestsScreen from '../screens/QuestsScreen';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import RewardsScreen from '../screens/RewardsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Quests" component={QuestsScreen} />
        <Tab.Screen name="Leaderboards" component={LeaderboardsScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Rewards" component={RewardsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default TabNavigator;
