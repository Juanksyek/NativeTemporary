import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Switch, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCedula } from '@/context/CedulaContext';

import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { VolverButton } from '@/components/ui/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL   = 'https://fmru-next-js.vercel.app';
const CEDULA_URL = `${BASE_URL}/api/app-native-api/cedulas/crear-cedula`;
const EMAIL_URL  = `${BASE_URL}/api/app-native-api/cedulas/enviar-cedulas`;
const HIST_URL   = `${BASE_URL}/api/historicos/generar`;

const NEXT_MATCH_STORAGE_KEY = 'next_match_data';

type PostOpts = { timeoutMs?: number; retries?: number; backoffMs?: number };

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function postJson(url: string, body: any, opts: PostOpts = {}) {
  const { timeoutMs = 25000, retries = 0, backoffMs = 1200 } = opts;

  const attempt = async () => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain;q=0.5, */*;q=0.1'
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(id);

      const ct = res.headers.get('content-type') || '';
      if (res.status === 204) {
        return { ok: res.ok, status: res.status, headers: res.headers, data: undefined, text: '' };
      }
      if (ct.includes('application/json')) {
        let data: any;
        try { data = await res.json(); } catch { }
        return { ok: res.ok, status: res.status, headers: res.headers, data };
      } else {
        const text = await res.text().catch(() => undefined);
        return { ok: res.ok, status: res.status, headers: res.headers, text };
      }
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await attempt();
    } catch (e: any) {
      lastErr = e;
      if (i < retries && (e?.name === 'AbortError')) {
        await sleep(backoffMs * (i + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

const Input = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}) => {
  const colorScheme = useColorScheme();
    return (
      <View style={styles.section}>
        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            { backgroundColor: Colors[colorScheme].inputBackground, color: Colors[colorScheme].text }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors[colorScheme].textSecondary}
          multiline={multiline}
          autoCorrect={false}
          autoCapitalize="none"
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          returnKeyType="done"
          blurOnSubmit
        />
      </View>
    );
});

export default function RecoleccionFirmas() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { cedulaData, jugadoresLocal, jugadoresVisitante } = useCedula();

  // Imprimir jugadores al montar el componente
  React.useEffect(() => {
    console.log('👥 jugadoresLocal (on mount):', jugadoresLocal);
    console.log('👥 jugadoresVisitante (on mount):', jugadoresVisitante);
  }, [jugadoresLocal, jugadoresVisitante]);

  const [form, setForm] = useState({
    capitanLocalNombre: '',
    capitanLocalFirma: '',
    capitanVisitaNombre: '',
    capitanVisitaFirma: '',
    repLocalNombre: '',
    repLocalFirma: '',
    repLocalTel: '',
    repVisitaNombre: '',
    repVisitaFirma: '',
    repVisitaTel: '',
    esFinal: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  async function getNextMatchFromStorage(): Promise<any | null> {
    try {
      const saved = await AsyncStorage.getItem(NEXT_MATCH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('No se pudo leer NEXT_MATCH_STORAGE_KEY:', e);
      return null;
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const {
      capitanLocalNombre, capitanLocalFirma,
      capitanVisitaNombre, capitanVisitaFirma,
      repLocalNombre, repLocalFirma, repLocalTel,
      repVisitaNombre, repVisitaFirma, repVisitaTel,
      esFinal
    } = form;

    const missing: string[] = [];
    if (!capitanLocalNombre) missing.push("Nombre del capitán local");
    if (!capitanLocalFirma) missing.push("Firma del capitán local");
    if (!capitanVisitaNombre) missing.push("Nombre del capitán visitante");
    if (!capitanVisitaFirma) missing.push("Firma del capitán visitante");
    if (!repLocalNombre) missing.push("Nombre del representante del bienestar local");
    if (!repLocalFirma) missing.push("Firma del representante del bienestar local");
    if (!repLocalTel) missing.push("Teléfono del representante del bienestar local");
    if (!repVisitaNombre) missing.push("Nombre del representante del bienestar visitante");
    if (!repVisitaFirma) missing.push("Firma del representante del bienestar visitante");
    if (!repVisitaTel) missing.push("Teléfono del representante del bienestar visitante");

    if (missing.length > 0) {
      Toast.show({ type: 'error', text1: 'Error al crear la cédula', text2: `Faltan datos: ${missing.join(', ')}` });
      setIsSubmitting(false);
      return;
    }

    const datosFirmas = {
      capitanLocal: { nombre: capitanLocalNombre, firma: capitanLocalFirma },
      capitanVisita: { nombre: capitanVisitaNombre, firma: capitanVisitaFirma },
      representanteLocal: { nombre: repLocalNombre, firma: repLocalFirma, telefono: repLocalTel },
      representanteVisita: { nombre: repVisitaNombre, firma: repVisitaFirma, telefono: repVisitaTel }
    };

    const marcadorTransformado = (cedulaData.marcador || []).map((p: any) => ({
      ...p,
      equipo:
        p.equipo === 'A'
          ? cedulaData.equipoLocal?.nombre
          : p.equipo === 'B'
          ? cedulaData.equipoVisitante?.nombre
          : p.equipo,
    }));

    const payloadCedula: any = {
      ...cedulaData,
      marcador: [...(cedulaData.marcador || [])],
      registroPuntos: marcadorTransformado,
      firmas: datosFirmas,
      esFinal,
    };

    try {
      const res = await postJson(CEDULA_URL, payloadCedula, { timeoutMs: 30000, retries: 0 });
      console.log('📥 Respuesta crear-cedula:', res.data ?? res.text);

      if (!res.ok) {
        const msg = (res.data as any)?.message || res.text || 'No se pudo enviar la cédula.';
        Toast.show({ type: 'error', text1: 'Error', text2: msg });
        setIsSubmitting(false);
        return;
      }

      const cedula = (res.data as any)?.cedula;
      if (!cedula) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'El servidor no devolvió la cédula.' });
        setIsSubmitting(false);
        return;
      }

      const nextMatch = await getNextMatchFromStorage(); // puede ser null
      const partidoIdFinal = Number(
        cedula?.partidoId ??
        cedulaData?.partidoId ??
        nextMatch?.id
      );
      const tipoPartidoFinal =
        cedula?.tipoPartido ??
        cedula?.datosPartido?.tipoPartido ??
        cedulaData?.tipoPartido ??
        nextMatch?.tipoPartido ?? 'torneo';

      try {
        const histPayload = {
          partidoId: partidoIdFinal,
          tipoPartido: tipoPartidoFinal,
          horaInicio: cedula?.horaInicio,
          estadoTerreno: cedula?.estadoTerreno,
          marcador: cedula?.marcador ?? [],
          cambios: cedula?.cambios ?? [],
          lesiones: cedula?.lesiones ?? [],
          tarjetas: cedula?.tarjetas ?? [],
          observaciones: cedula?.observaciones ?? {},
          firmas: cedula?.firmas ?? datosFirmas,
          asistioArbitro: !!cedula?.asistioArbitro,
          asistioParamedico: !!cedula?.asistioParamedico,
          resultadoResumen: cedula?.resultadoResumen,
          equipoGanador: cedula?.equipoGanador,
          esFinal: !!(cedula?.esFinal ?? esFinal),
          equipoLocal: {
            id: Number(
              cedula?.datosPartido?.equipoLocal?.id ??
              (cedulaData?.equipoLocal && 'id' in cedulaData.equipoLocal ? (cedulaData.equipoLocal as any).id : undefined) ??
              (nextMatch?.equipoLocal && 'id' in nextMatch.equipoLocal ? (nextMatch.equipoLocal as any).id : undefined)
            ),
            nombre: cedula?.datosPartido?.equipoLocal?.nombre ?? cedulaData?.equipoLocal?.nombre ?? nextMatch?.equipoLocal?.nombre ?? ''
          },
          equipoVisitante: {
            id: Number(
              cedula?.datosPartido?.equipoVisitante?.id ??
              (cedulaData?.equipoVisitante && 'id' in cedulaData.equipoVisitante ? (cedulaData.equipoVisitante as any).id : undefined) ??
              (nextMatch?.equipoVisitante && 'id' in nextMatch.equipoVisitante ? (nextMatch.equipoVisitante as any).id : undefined)
            ),
            nombre: cedula?.datosPartido?.equipoVisitante?.nombre ?? cedulaData?.equipoVisitante?.nombre ?? nextMatch?.equipoVisitante?.nombre ?? ''
          },
          fecha:
            cedula?.datosPartido?.fecha ||
            nextMatch?.fecha ||
            new Date().toISOString().slice(0, 10),
        };

        if (!Number.isFinite(histPayload.partidoId) || !histPayload.tipoPartido) {
          console.warn('⚠️ histPayload inválido:', histPayload);
        }

        const hist = await postJson(HIST_URL, histPayload, { timeoutMs: 30000, retries: 1 });
        console.log('📗 Respuesta históricos (status):', hist.status, 'ok:', hist.ok, 'body:', hist.data ?? hist.text ?? '(vacío)');
        if (!hist.ok) {
          const msg = (hist.data as any)?.error || (hist.data as any)?.message || hist.text || `Error ${hist.status} al generar históricos`;
          Toast.show({ type: 'error', text1: 'Históricos', text2: msg });
        }
      } catch (e) {
        console.error('❌ Error al llamar históricos:', e);
        Toast.show({ type: 'error', text1: 'Históricos', text2: 'Error al generar históricos' });
      }

      if (!Number.isFinite(partidoIdFinal) || partidoIdFinal <= 0) {
      // Define CedulaDataWithJugadores type inline to avoid type errors
      type CedulaDataWithJugadores = typeof cedulaData & {
        jugadoresLocal?: any[];
        jugadoresVisitante?: any[];
      };
      const { jugadoresLocal = [], jugadoresVisitante = [] } = cedulaData as CedulaDataWithJugadores;
        return;
      }


      // Tomar los jugadores igual que en puntos.tsx (del contexto)
      console.log('👥 jugadoresLocal (from context):', jugadoresLocal);
      console.log('👥 jugadoresVisitante (from context):', jugadoresVisitante);
      // Enviar también los jugadores al endpoint de correos
      const mailPayload = {
        partidoId: partidoIdFinal,
        jugadoresLocal,
        jugadoresVisitante
      };
      const mail = await postJson(EMAIL_URL, mailPayload, { timeoutMs: 30000, retries: 0 });
      console.log('📧 Respuesta envío correo (status):', mail.status, 'ok:', mail.ok, 'body:', mail.data ?? mail.text);

      if (!mail.ok) {
        const msg = (mail.data as any)?.message || mail.text || `Error ${mail.status} al enviar correo`;
        Toast.show({ type: 'error', text1: 'Correo', text2: msg });
        setIsSubmitting(false);
        return;
      }

      Toast.show({ type: 'success', text1: '✅ Éxito', text2: 'Cédula, históricos y correos enviados' });
      router.replace({ pathname: '/(protected)/(cedulas)/resumen-final', params: { resetNavigation: 'true' } });
    } catch (err) {
      console.error('❌ Error en flujo de envío:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo completar el envío.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Recolección de firmas</Text>

        <Input label="Capitán Local (Nombre)" value={form.capitanLocalNombre} onChangeText={v => updateField('capitanLocalNombre', v)} placeholder="Nombre" />
        <Input label="Capitán Local (Firma)" value={form.capitanLocalFirma} onChangeText={v => updateField('capitanLocalFirma', v)} placeholder="Firma" multiline />

        <Input label="Capitán Visitante (Nombre)" value={form.capitanVisitaNombre} onChangeText={v => updateField('capitanVisitaNombre', v)} placeholder="Nombre" />
        <Input label="Capitán Visitante (Firma)" value={form.capitanVisitaFirma} onChangeText={v => updateField('capitanVisitaFirma', v)} placeholder="Firma" multiline />

        <Input label="Representante del bienestar Local (Nombre)" value={form.repLocalNombre} onChangeText={v => updateField('repLocalNombre', v)} placeholder="Nombre" />
        <Input label="Representante del bienestar Local (Firma)" value={form.repLocalFirma} onChangeText={v => updateField('repLocalFirma', v)} placeholder="Firma" multiline />
        <Input label="Representante del bienestar Local (Teléfono)" value={form.repLocalTel} onChangeText={v => updateField('repLocalTel', v)} placeholder="Teléfono" keyboardType="phone-pad" />

        <Input label="Representante del bienestar Visitante (Nombre)" value={form.repVisitaNombre} onChangeText={v => updateField('repVisitaNombre', v)} placeholder="Nombre" />
        <Input label="Representante del bienestar Visitante (Firma)" value={form.repVisitaFirma} onChangeText={v => updateField('repVisitaFirma', v)} placeholder="Firma" multiline />
        <Input label="Representante del bienestar Visitante (Teléfono)" value={form.repVisitaTel} onChangeText={v => updateField('repVisitaTel', v)} placeholder="Teléfono" keyboardType="phone-pad" />

        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: Colors[colorScheme].text }]}>¿Este partido es una final?</Text>
          <Switch
            value={form.esFinal}
            onValueChange={v => updateField('esFinal', v)}
            trackColor={{ false: Colors[colorScheme].border, true: Colors[colorScheme].tint }}
            thumbColor={Colors[colorScheme].cardBackground}
          />
        </View>

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: Colors[colorScheme].buttonPrimary }]} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={[styles.submitText, { color: Colors[colorScheme].buttonText }]}>
            {isSubmitting ? 'Enviando…' : 'Confirmar y continuar'}
          </Text>
        </TouchableOpacity>

        <VolverButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 100,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  submitButton: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
  },
});