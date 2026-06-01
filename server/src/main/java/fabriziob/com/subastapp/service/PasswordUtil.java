package fabriziob.com.subastapp.service;

import java.security.SecureRandom;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public final class PasswordUtil {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordUtil() {
    }

    public static String generateTemporary() {
        return IntStream.range(0, 8)
                .mapToObj(i -> String.valueOf(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length()))))
                .collect(Collectors.joining());
    }
}
