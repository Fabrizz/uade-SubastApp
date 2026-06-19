package fabriziob.com.subastapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import fabriziob.com.subastapp.repository.UserRepository;
import fabriziob.com.subastapp.repository.EmpleadoRepository;
import fabriziob.com.subastapp.repository.DuenioRepository;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.Empleado;
import fabriziob.com.subastapp.entity.Duenio;

import java.util.List;

@SpringBootTest
class SubastappApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private EmpleadoRepository empleadoRepository;

	@Autowired
	private DuenioRepository duenioRepository;

	@Test
	@Transactional
	void contextLoads() {
		System.out.println("=== DIAGNOSTIC DATABASE START ===");
		try {
			List<Persona> personas = userRepository.findAll();
			System.out.println("PERSONAS IN DATABASE (Count: " + personas.size() + "):");
			for (Persona p : personas) {
				System.out.println(" - ID: " + p.getIdentificador() + ", Name: " + p.getNombre() + ", Email: " + p.getUsername());
			}

			List<Empleado> empleados = empleadoRepository.findAll();
			System.out.println("EMPLOYEES IN DATABASE (Count: " + empleados.size() + "):");
			for (Empleado e : empleados) {
				String empName = (e.getPersona() != null) ? e.getPersona().getNombre() : "NO_PERSONA";
				System.out.println(" - ID: " + e.getIdentificador() + ", Cargo: " + e.getCargo() + ", Name: " + empName);
			}

			List<Duenio> duenios = duenioRepository.findAll();
			System.out.println("DUENIOS IN DATABASE (Count: " + duenios.size() + "):");
			for (Duenio d : duenios) {
				String ownerName = (d.getPersona() != null) ? d.getPersona().getNombre() : "NO_PERSONA";
				System.out.println(" - ID: " + d.getIdentificador() + ", Name: " + ownerName);
			}
		} catch (Exception e) {
			System.out.println("Error running diagnostics:");
			e.printStackTrace();
		}
		System.out.println("=== DIAGNOSTIC DATABASE END ===");
	}

}

