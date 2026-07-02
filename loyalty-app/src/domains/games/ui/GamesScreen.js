import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/theme';
import { API_CONFIG } from '../../../shared/api/config';

export const GamesScreen = ({ userToken }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояния игрового процесса: 'idle' (ожидание), 'playing' (игра идет)
  const [gameState, setGameState] = useState('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  // Данные текущей головоломки
  const [puzzle, setPuzzle] = useState({ a: 0, b: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/profile/`, {
        headers: { 'x-token': userToken },
      });
      if (!res.ok) throw new Error('Ошибка загрузки профиля');
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userToken]);

  const handleStartGame = async () => {
    if (profile?.energy < 20) {
      Alert.alert('Мало энергии!', 'Для начала игры требуется минимум 20 единиц энергии.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/games/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': userToken,
        },
        body: JSON.stringify({ game_name: 'math_puzzle' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Ошибка запуска игры');

      // Генерируем простую математическую задачу для симуляции игры
      const a = Math.floor(Math.random() * 50) + 1;
      const b = Math.floor(Math.random() * 50) + 1;
      setPuzzle({ a, b, answer: a + b });
      setUserAnswer('');
      
      setGameState('playing');
      fetchProfile(); // Обновляем профиль, чтобы показать списание 20 энергии
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Ошибка', 'Введите ваш ответ');
      return;
    }

    setIsProcessing(true);
    // Проверяем правильность ответа
    const isSuccess = parseInt(userAnswer.trim(), 10) === puzzle.answer;

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/games/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': userToken,
        },
        body: JSON.stringify({
          game_name: 'math_puzzle',
          level_id: profile.level,
          is_success: isSuccess
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Ошибка отправки результата');

      // Показываем результат пользователю
      if (isSuccess) {
        Alert.alert('Победа! 🎉', `Уровень пройден! Текущий уровень: ${data.current_level}\nКоэффициент кэшбека увеличен до x${data.new_coefficient}`);
      } else {
        Alert.alert('Поражение 😔', 'Ответ неверный. Энергия потрачена, уровень не изменен.');
      }

      setGameState('idle');
      fetchProfile(); // Обновляем профиль (уровень и множитель)
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Шапка с метриками */}
      <View style={styles.headerCard}>
        <Typography variant="h2" weight="bold" color="primary" align="center">
          Игровая зона
        </Typography>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Typography variant="h3" weight="bold">{profile?.level}</Typography>
            <Typography variant="xs" color="textSecondary">Уровень</Typography>
          </View>
          <View style={styles.statBox}>
            <Typography variant="h3" weight="bold" color="primary">{profile?.energy}</Typography>
            <Typography variant="xs" color="textSecondary">Энергия</Typography>
          </View>
        </View>
      </View>

      {/* Игровой процесс */}
      {gameState === 'idle' ? (
        <View style={styles.gameCard}>
          <Typography variant="body" weight="bold" style={{ marginBottom: 10 }}>
            Математическая головоломка
          </Typography>
          <Typography variant="sm" color="textSecondary" style={{ marginBottom: 20 }}>
            Решите задачу, чтобы повысить свой уровень и увеличить множитель кэшбека.
            Стоимость одной игры: 20 энергии.
          </Typography>
          <Button 
            title="Начать игру (-20 Энергии)" 
            onPress={handleStartGame} 
            disabled={isProcessing} 
          />
        </View>
      ) : (
        <View style={styles.gameCard}>
          <Typography variant="h2" weight="bold" align="center" style={{ marginBottom: 20 }}>
            {puzzle.a} + {puzzle.b} = ?
          </Typography>
          
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="number-pad"
            placeholder="Ваш ответ"
            maxLength={5}
          />
          
          <Button 
            title="Ответить" 
            onPress={handleSubmitResult} 
            disabled={isProcessing} 
          />
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  gameCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
});