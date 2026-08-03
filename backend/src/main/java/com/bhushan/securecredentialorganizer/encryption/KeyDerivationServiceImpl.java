package com.bhushan.securecredentialorganizer.encryption;

import com.bhushan.securecredentialorganizer.config.Argon2Properties;
import lombok.RequiredArgsConstructor;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.nio.charset.StandardCharsets;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;

@Service
@RequiredArgsConstructor
public class KeyDerivationServiceImpl implements KeyDerivationService {

    private final Argon2Properties argon2Properties;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public byte[] generateSalt() {
        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);
        return salt;
    }

    @Override
    public byte[] deriveKey(char[] password, byte[] salt) {
        Argon2Parameters.Builder builder = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withIterations(argon2Properties.getIterations())
                .withMemoryAsKB(argon2Properties.getMemoryKb())
                .withParallelism(argon2Properties.getParallelism())
                .withSalt(salt);

        Argon2Parameters parameters = builder.build();
        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(parameters);

        byte[] result = new byte[32];
        byte[] passwordBytes = null;
        
        try {
            passwordBytes = toByteArray(password);
            generator.generateBytes(passwordBytes, result, 0, result.length);
            return result;
        } finally {
            if (passwordBytes != null) {
                Arrays.fill(passwordBytes, (byte) 0);
            }
        }
    }

    private byte[] toByteArray(char[] chars) {
        CharBuffer charBuffer = CharBuffer.wrap(chars);
        ByteBuffer byteBuffer = StandardCharsets.UTF_8.encode(charBuffer);
        byte[] bytes = Arrays.copyOfRange(byteBuffer.array(),
                byteBuffer.position(), byteBuffer.limit());
        Arrays.fill(byteBuffer.array(), (byte) 0);
        return bytes;
    }
}
