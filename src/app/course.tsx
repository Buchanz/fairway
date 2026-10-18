import {GlassPressable as Pressable,GlassPanel} from '../components/Glass';
import { useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { courses } from '../data/courses';
import { colors } from '../components/ui';
export default function Course() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courses.find(c => c.id === id);
  const [error, setError] = useState('');
  if (!course) return <View style={s.page}><Text style={s.title}>Course not found</Text><Link href="/">Back to search</Link></View>;
  async function openBooking() {
    try { setError(''); await Linking.openURL(course!.bookingUrl); }
    catch { setError('Could not open the website. Please try again.'); }
  }
  return <ScrollView contentContainerStyle={s.page}><Text style={s.kicker}>GREATER VICTORIA · VANCOUVER ISLAND</Text><Text style={s.title}>{course.name}</Text><Text style={s.body}>{course.municipality} · {course.holes} holes</Text><GlassPanel style={s.panel}><Text style={s.heading}>Check with the course</Text><Text style={s.body}>Live availability is not connected to Fairway yet. Visit the course’s official website to view tee times, current CAD prices, and booking policies.</Text><Text style={s.body}>Online booking provider: {course.provider}</Text><Pressable accessibilityRole="link" onPress={openBooking} style={s.button}><Text style={s.buttonText}>Check course website ↗</Text></Pressable>{error !== '' && <Text accessibilityLiveRegion="polite" style={s.body}>{error}</Text>}</GlassPanel><Text style={s.body}>You’ll leave Fairway to book directly with the course. No reservation is made in this app.</Text><Link href="/" style={s.back}>← Explore more courses</Link></ScrollView>;
}
const s = StyleSheet.create({ page: { padding: 24, gap: 24, maxWidth: 780, width: '100%', alignSelf: 'center' }, kicker: { fontSize: 11, letterSpacing: 1, color: colors.muted }, title: { fontSize: 36, color: colors.ink, fontWeight: '700' }, heading: { fontSize: 22, color: colors.ink, fontWeight: '600' }, body: { color: colors.muted, fontSize: 16, lineHeight: 26 }, panel: { backgroundColor: '#E9EFDF', padding: 24, borderRadius: 22, gap: 14 }, button: { backgroundColor: colors.green, padding: 18, borderRadius: 14 }, buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' }, back: { color: colors.green, paddingVertical: 18, fontSize: 16 } });
