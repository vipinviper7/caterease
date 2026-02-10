import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Text, Card, Button } from '@/src/components/ui';
import { PORTION_RECOMMENDATIONS, COLORS } from '@/src/utils/constants';

type Course = keyof typeof PORTION_RECOMMENDATIONS;

export default function PortionPlannerScreen() {
  const [guestCount, setGuestCount] = useState(50);
  const [activeCourses, setActiveCourses] = useState<Set<Course>>(
    new Set(['starters', 'mains', 'rice', 'desserts', 'beverages'])
  );

  const toggleCourse = (course: Course) => {
    setActiveCourses(prev => {
      const next = new Set(prev);
      if (next.has(course)) next.delete(course);
      else next.add(course);
      return next;
    });
  };

  const recommendations = Array.from(activeCourses).map(course => {
    const rec = PORTION_RECOMMENDATIONS[course];
    return {
      course,
      label: course.charAt(0).toUpperCase() + course.slice(1),
      perHead: rec.perHead,
      unit: rec.unit,
      total: rec.perHead * guestCount,
    };
  });

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
      <Text variant="body" className="text-neutral-600 mb-6">
        Plan the right portions for your event to avoid waste and ensure every guest is well-fed.
      </Text>

      {/* Guest Count */}
      <Card variant="outlined" className="p-4 mb-6">
        <Text variant="body" weight="semibold" className="mb-3">Number of Guests</Text>
        <View className="flex-row items-center justify-center">
          <TouchableOpacity
            onPress={() => setGuestCount(Math.max(10, guestCount - 10))}
            className="w-12 h-12 rounded-full bg-neutral-100 items-center justify-center"
          >
            <Minus size={20} color={COLORS.neutral700} />
          </TouchableOpacity>
          <Text variant="h1" weight="bold" className="mx-8">{guestCount}</Text>
          <TouchableOpacity
            onPress={() => setGuestCount(guestCount + 10)}
            className="w-12 h-12 rounded-full bg-neutral-100 items-center justify-center"
          >
            <Plus size={20} color={COLORS.neutral700} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Course Toggles */}
      <Text variant="body" weight="semibold" className="mb-3">Select Courses</Text>
      <View className="mb-6">
        {(Object.keys(PORTION_RECOMMENDATIONS) as Course[]).map((course) => (
          <TouchableOpacity
            key={course}
            onPress={() => toggleCourse(course)}
            className="flex-row items-center justify-between py-3 border-b border-neutral-100"
          >
            <Text variant="body-sm" weight="medium">
              {course.charAt(0).toUpperCase() + course.slice(1)}
            </Text>
            <View className={`w-12 h-7 rounded-full p-0.5 ${activeCourses.has(course) ? 'bg-primary' : 'bg-neutral-300'}`}>
              <View className={`w-6 h-6 rounded-full bg-white ${activeCourses.has(course) ? 'self-end' : 'self-start'}`} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommendations */}
      <Text variant="body" weight="semibold" className="mb-3">Recommended Quantities</Text>
      {recommendations.map((rec) => (
        <Card key={rec.course} variant="outlined" className="p-4 mb-3">
          <Text variant="body-sm" weight="semibold" className="mb-1">{rec.label}</Text>
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-neutral-500">
              {rec.perHead} {rec.unit} per person
            </Text>
            <Text variant="body-sm" weight="bold" className="text-primary">
              {rec.total.toLocaleString()} {rec.unit} total
            </Text>
          </View>
        </Card>
      ))}

      <Card className="p-4 mt-4 mb-8 bg-primary-light">
        <Text variant="body-sm" weight="medium" className="text-primary">
          Pro tip: Order 10-15% extra for buffet-style service to ensure adequate portions throughout the event.
        </Text>
      </Card>
    </ScrollView>
  );
}
