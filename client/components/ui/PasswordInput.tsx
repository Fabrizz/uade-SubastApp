import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  containerStyle?: ViewStyle;
};

export default function PasswordInput({ containerStyle, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
      <TextInput
        placeholder="••••••••"
        placeholderTextColor="#555"
        autoCapitalize="none"
        {...props}
        secureTextEntry={!visible}
        style={[{
          height: 50,
          backgroundColor: '#262626',
          borderWidth: 1,
          borderColor: '#404040',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingRight: 48,
          color: 'white',
          fontSize: 16,
        }, style]}
      />
      <TouchableOpacity
        onPress={() => setVisible(v => !v)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
      >
        {visible
          ? <EyeOff size={18} color="#6b7280" />
          : <Eye size={18} color="#6b7280" />
        }
      </TouchableOpacity>
    </View>
  );
}
