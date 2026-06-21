// src/components/LoginModal.tsx - VERIFIQUE ESTAS PARTES 15/06
// src/components/LoginModal.tsx 21/06/2026
// Adicione a tela de "verifique seu e-mail"

const [showVerificationMessage, setShowVerificationMessage] = useState(false);
const [registrationEmail, setRegistrationEmail] = useState('');

const handleRegister = async () => {
  // ... validações
  const result = await registerWithEmail(email.trim(), password, name.trim());
  
  if (result.success) {
    setRegistrationEmail(email.trim());
    setShowVerificationMessage(true);
    setEmail('');
    setPassword('');
    setName('');
    setIsRegisterMode(false);
  } else {
    Alert.alert('Erro', result.message);
  }
};

// Na renderização:
{showVerificationMessage && (
  <View style={styles.verificationContainer}>
    <Text style={styles.verificationTitle}>📧 Verifique seu e-mail</Text>
    <Text style={styles.verificationText}>
      Enviamos um link de confirmação para:
    </Text>
    <Text style={styles.verificationEmail}>{registrationEmail}</Text>
    <Text style={styles.verificationText}>
      Clique no link para ativar sua conta e depois faça login.
    </Text>
    <TouchableOpacity 
      style={styles.verificationButton}
      onPress={() => setShowVerificationMessage(false)}
    >
      <Text style={styles.verificationButtonText}>✅ Voltar ao login</Text>
    </TouchableOpacity>
  </View>
)}
