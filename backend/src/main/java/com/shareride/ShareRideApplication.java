package com.shareride;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;

@SpringBootApplication
public class ShareRideApplication {
   public static void main(String[] a) {
      SpringApplication.run(ShareRideApplication.class, a);
   }

   /** Seeds demo data on first run. Demo password for all users: password123 */
   @Bean
   CommandLineRunner seed(UserRepo users, JourneyRepo journeys, PasswordEncoder pe) {
      return a -> {
         if (users.count() > 0)
            return;
         String[][] u = { { "Ramesh Rao", "4.8", "18" }, { "Mahesh Kumar", "4.8", "42" },
               { "Anitha Reddy", "4.9", "31" } };
         for (String[] x : u) {
            AppUser m = new AppUser();
            m.setName(x[0]);
            m.setEmail(x[0].split(" ")[0].toLowerCase() + "@example.com");
            m.setPasswordHash(pe.encode("password123"));
            m.setAvatar("https://api.dicebear.com/9.x/initials/svg?seed=" + x[0].replace(" ", "+"));
            m.setRating(Double.parseDouble(x[1]));
            m.setTotalJourneys(Integer.parseInt(x[2]));
            m.setVerified(true);
            m.setMemberSince("2023");
            m.setBio("ShareRide community member.");
            users.save(m);
         }
         String[][] j = { { "Hyderabad", "Vijayawada", "LB Nagar", "Benz Circle", "08:00", "450", "Maruti Baleno" },
               { "Hyderabad", "Bengaluru", "Gachibowli", "Majestic", "07:00", "900", "Hyundai Creta" },
               { "Bengaluru", "Chennai", "Silk Board", "Koyambedu", "09:00", "600", "Toyota Innova" } };
         long[] host = { 2, 3, 2 };
         for (int i = 0; i < j.length; i++) {
            Journey v = new Journey();
            v.setHostId(host[i]);
            v.setOrigin(j[i][0]);
            v.setDestination(j[i][1]);
            v.setPickup(j[i][2]);
            v.setDropPoint(j[i][3]);
            v.setTravelDate(LocalDate.now().plusDays(i));
            v.setDepartureTime(j[i][4]);
            v.setDuration("—");
            v.setVehicleModel(j[i][6]);
            v.setVehicleType("Hatchback");
            v.setVehicleNumber("TS 09 AB 123" + i);
            v.setSeatsTotal(3);
            v.setSeatsAvailable(3);
            v.setContribution(Integer.parseInt(j[i][5]));
            v.setVerified(true);
            journeys.save(v);
         }
      };
   }
}
