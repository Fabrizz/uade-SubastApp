import { DNIData, parseDNI, randomApellido } from '@/lib/dni';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { Check, RefreshCw, ScanLine, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onScan: (data: DNIData) => void;
}

type State = 'idle' | 'scanning' | 'confirm';

export default function DniScanner({ onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState,  setScanState]      = useState<State>('idle');
  const [preview,    setPreview]        = useState<DNIData | null>(null);

  function handleBarCodeScanned({ data }: BarcodeScanningResult) {
    const real = parseDNI(data);
    setPreview({
      ...real,
      apellido: randomApellido(),
      nombre: real.nombre.split(/\s+/)[0] ?? real.nombre,
    });
    setScanState('confirm');
  }

  function handleConfirm() {
    if (preview) onScan(preview);
    setScanState('idle');
    setPreview(null);
  }

  function handleRescan() {
    setPreview(null);
    setScanState('scanning');
  }

  function handleClose() {
    setPreview(null);
    setScanState('idle');
  }

  if (!permission?.granted) {
    return (
      <TouchableOpacity
        onPress={requestPermission}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#383838', borderWidth: 1, borderColor: '#555555', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 }}
      >
        <ScanLine size={18} color="#2dd4bf" />
        <Text style={{ color: '#2dd4bf', fontSize: 14, fontWeight: '600' }}>
          Permitir cámara para escanear DNI
        </Text>
      </TouchableOpacity>
    );
  }

  /* ── Confirmación ── */
  if (scanState === 'confirm' && preview) {
    return (
      <View style={{ backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#2dd4bf40', padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Check size={16} color="#2dd4bf" />
          <Text style={{ color: '#2dd4bf', fontWeight: '700', fontSize: 14 }}>DNI leído — confirmá los datos</Text>
        </View>

        <Row label="Apellido"  value={preview.apellido} />
        <Row label="Nombre"    value={preview.nombre} />
        <Row label="DNI"       value={preview.dni} />
        <Row label="Nacimiento" value={preview.fechaNacimiento} />
        <Row label="Sexo"      value={preview.sexo} />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <TouchableOpacity
            onPress={handleRescan}
            activeOpacity={0.8}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#383838', borderWidth: 1, borderColor: '#555555', borderRadius: 10, paddingVertical: 10 }}
          >
            <RefreshCw size={14} color="#a3a3a3" />
            <Text style={{ color: '#a3a3a3', fontSize: 13, fontWeight: '600' }}>Volver a escanear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0f3d38', borderWidth: 1, borderColor: '#2dd4bf', borderRadius: 10, paddingVertical: 10 }}
          >
            <Check size={14} color="#2dd4bf" />
            <Text style={{ color: '#2dd4bf', fontSize: 13, fontWeight: '600' }}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Cámara activa ── */
  if (scanState === 'scanning') {
    return (
      <View style={{ gap: 12 }}>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#383838', borderWidth: 1, borderColor: '#555555', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 }}
        >
          <X size={18} color="#f87171" />
          <Text style={{ color: '#f87171', fontSize: 14, fontWeight: '600' }}>Cerrar cámara</Text>
        </TouchableOpacity>

        <View style={{ height: 200, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#404040' }}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            zoom={0.015}
            barcodeScannerSettings={{ barcodeTypes: ['pdf417'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <View style={{ width: '88%', height: 90, borderWidth: 2, borderColor: '#2dd4bf', borderRadius: 8, opacity: 0.8 }} />
            <Text style={{ color: '#5eead4', fontSize: 12, marginTop: 8, opacity: 0.8 }}>
              Apuntá al código de barras del dorso del DNI
            </Text>
          </View>
        </View>
      </View>
    );
  }

  /* ── Idle ── */
  return (
    <TouchableOpacity
      onPress={() => setScanState('scanning')}
      activeOpacity={0.8}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#383838', borderWidth: 1, borderColor: '#555555', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 }}
    >
      <ScanLine size={18} color="#2dd4bf" />
      <Text style={{ color: '#2dd4bf', fontSize: 14, fontWeight: '600' }}>Escanear DNI (opcional)</Text>
    </TouchableOpacity>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#737373', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#e5e5e5', fontSize: 13, fontWeight: '500', maxWidth: '65%', textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </View>
  );
}
