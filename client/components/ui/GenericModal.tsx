import { BlurView } from "expo-blur";
import React from "react";
import { Modal, Platform, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function GenericModal({ visible, onClose, children }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {Platform.OS === "ios" ? (
          <BlurView
            intensity={60}
            tint="dark"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : (
          <View
            style={[StyleSheet.absoluteFill, styles.androidBackdrop]}
            pointerEvents="none"
          />
        )}

        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  androidBackdrop: {
    backgroundColor: "rgba(0,0,0,0.75)",
  },
});
