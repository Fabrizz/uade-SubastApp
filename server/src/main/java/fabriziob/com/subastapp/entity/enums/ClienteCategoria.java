package fabriziob.com.subastapp.entity.enums;

import java.util.concurrent.ThreadLocalRandom;

public enum ClienteCategoria {
    // ('comun', 'especial', 'plata', 'oro', 'platino')
    // El orden de declaración es el ranking: comun (menor) → platino (mayor).
    comun,
    especial,
    plata,
    oro,
    platino;

    // Pesos de la asignación simulada por investigación (suman 100).
    private static final int[] PESOS = { 35, 30, 20, 10, 5 };

    public static ClienteCategoria randomPonderada() {
        int roll = ThreadLocalRandom.current().nextInt(100);
        int acumulado = 0;
        ClienteCategoria[] valores = values();
        for (int i = 0; i < valores.length; i++) {
            acumulado += PESOS[i];
            if (roll < acumulado)
                return valores[i];
        }
        return comun;
    }

    /** Devuelve la categoría de mayor ranking entre las dos (la mejora nunca baja). */
    public static ClienteCategoria mejorEntre(ClienteCategoria a, ClienteCategoria b) {
        if (a == null)
            return b;
        if (b == null)
            return a;
        return a.ordinal() >= b.ordinal() ? a : b;
    }
}
