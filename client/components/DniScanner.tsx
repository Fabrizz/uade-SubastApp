import { DNIData, parseDNI, randomizeDNI } from '@/lib/dni';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { ScanLine, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DNIScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOn, setCameraOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [dniData, setDniData] = useState<DNIData | null>(null);

  function handleBarCodeScanned({ data }: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);
    setCameraOn(false); // 👈 turn off camera after scan
    setDniData(randomizeDNI(parseDNI(data)));
  }

  if (!permission?.granted) {
    return (
      <View className="items-center p-4">
        <Pressable onPress={requestPermission} className="bg-[#90009A] px-6 py-3 rounded-xl">
          <Text className="text-white font-montserrat-bold">Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {/* Toggle button */}
      <Pressable
        onPress={() => { setCameraOn(v => !v); setScanned(false); }}
        className="flex-row items-center justify-center gap-2 bg-[#90009A] px-6 py-3 rounded-xl"
      >
        {cameraOn
          ? <X size={18} color="white" />
          : <ScanLine size={18} color="white" />
        }
        <Text className="text-white font-montserrat-bold">
          {cameraOn ? 'Cerrar cámara' : 'Escanear DNI'}
        </Text>
      </Pressable>

      {/* Camera preview */}
      {cameraOn && (
        <View style={{ width: '100%', height: 220, borderRadius: 16, overflow: 'hidden' }}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            zoom={0.015}  // 👈 slight zoom to avoid ultra-wide lens
            barcodeScannerSettings={{ barcodeTypes: ['pdf417'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          {/* Scan guide overlay */}
          <View style={StyleSheet.absoluteFill} className="items-center justify-center">
            <View style={{
              width: '90%', height: 100,
              borderWidth: 2, borderColor: '#72FFDF',
              borderRadius: 8, opacity: 0.7
            }} />
          </View>
        </View>
      )}

      {/* Result */}
      {dniData && !cameraOn && (
        <View className="gap-2 p-4 bg-[#171717] rounded-xl border border-[#333]">
          <Text className="text-white font-montserrat-bold text-lg">DNI Escaneado ✓</Text>
          <Text className="text-white font-montserrat">Apellido: {dniData.apellido}</Text>
          <Text className="text-white font-montserrat">Nombre: {dniData.nombre}</Text>
          <Text className="text-white font-montserrat">DNI: {dniData.dni}</Text>
          <Text className="text-white font-montserrat">Nacimiento: {dniData.fechaNacimiento}</Text>
          <Text className="text-white font-montserrat">Vencimiento: {dniData.fechaVencimiento}</Text>
          <Text className="text-white font-montserrat">Trámite: {dniData.tramite}</Text>
        </View>
      )}
    </View>
  );
}