-- MySQL dump 10.13  Distrib 9.6.0, for macos15 (arm64)
--
-- Host: localhost    Database: HealthcareDB
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'bcfe5492-f840-11f0-83e6-85a7b69ae29e:1-228';

--
-- Table structure for table `Appointment`
--

DROP TABLE IF EXISTS `Appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Appointment` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_date` datetime NOT NULL,
  `status` enum('Scheduled','Cancelled','Completed') NOT NULL,
  `notes` text,
  PRIMARY KEY (`appointment_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `idx_appt_date` (`appointment_date`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `Doctor` (`doctor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Appointment`
--

LOCK TABLES `Appointment` WRITE;
/*!40000 ALTER TABLE `Appointment` DISABLE KEYS */;
INSERT INTO `Appointment` VALUES (1,1,1,'2026-03-10 10:00:00','Completed','Routine cardiac checkup'),(2,2,2,'2026-03-12 11:30:00','Completed','Migraine follow-up'),(3,3,3,'2026-03-15 09:00:00','Completed','Knee pain evaluation'),(4,4,1,'2026-04-01 14:00:00','Completed','BP monitoring'),(5,5,4,'2026-04-05 10:30:00','Completed','General checkup'),(6,6,5,'2026-04-06 16:00:00','Completed','Skin rash consultation'),(7,2,1,'2026-04-07 09:00:00','Completed','Patient unavailable'),(8,1,3,'2026-04-28 00:36:00','Completed','Elbow Fracture'),(9,5,5,'2026-04-20 21:00:00','Scheduled','Wear Shoes'),(10,1,2,'2026-04-20 09:00:00','Scheduled','Routine checkup'),(11,2,3,'2026-04-20 10:30:00','Scheduled','Follow-up on knee pain'),(12,3,4,'2026-04-21 11:00:00','Scheduled','Skin rash evaluation'),(13,4,1,'2026-04-21 14:00:00','Scheduled','Blood pressure review'),(14,5,5,'2026-04-22 04:00:00','Completed','Child vaccination'),(15,6,6,'2026-04-22 11:30:00','Completed','Headache and dizziness'),(16,7,2,'2026-04-18 10:00:00','Completed','Post-surgery checkup'),(17,1,7,'2026-04-17 09:00:00','Cancelled','Patient rescheduled'),(18,3,8,'2026-04-23 15:00:00','Scheduled','Cancer screening'),(19,2,9,'2026-04-23 10:30:00','Completed','X-ray review'),(21,1,7,'2026-04-22 10:00:00','Scheduled','Nose Pain');
/*!40000 ALTER TABLE `Appointment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `notify_on_bill` AFTER UPDATE ON `appointment` FOR EACH ROW BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Auto bill
        INSERT INTO Bill(patient_id, appointment_id, amount, payment_status)
        VALUES (NEW.patient_id, NEW.appointment_id, 1000.00, 'Pending');
        -- Auto notification
        INSERT INTO Notification(patient_id, doctor_id, message, type)
        VALUES (NEW.patient_id, NEW.doctor_id,
                'Your appointment is complete. Bill generated.',
                'Appointment');
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Bill`
--

DROP TABLE IF EXISTS `Bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Bill` (
  `bill_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `appointment_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bill_type` enum('Consultation','Surgery','Lab Test','Pharmacy','Room Charge','Emergency') DEFAULT 'Consultation',
  `payment_status` enum('Pending','Paid','Claimed') NOT NULL,
  `insurance_claim_id` varchar(50) DEFAULT NULL,
  `bill_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bill_id`),
  KEY `patient_id` (`patient_id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `bill_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `bill_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `Appointment` (`appointment_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Bill`
--

LOCK TABLES `Bill` WRITE;
/*!40000 ALTER TABLE `Bill` DISABLE KEYS */;
INSERT INTO `Bill` VALUES (1,1,1,1500.00,'Consultation','Paid','CLM-001','2026-04-05 06:51:10'),(2,2,2,2000.00,'Consultation','Paid','CLM-002','2026-04-05 06:51:10'),(3,3,3,3500.00,'Consultation','Paid','CLM-003','2026-04-05 06:51:10'),(4,4,4,1800.00,'Consultation','Pending',NULL,'2026-04-05 06:51:10'),(5,5,5,500.00,'Consultation','Pending',NULL,'2026-04-05 06:51:10'),(6,6,6,800.00,'Consultation','Pending',NULL,'2026-04-05 06:51:10'),(7,5,5,1000.00,'Consultation','Pending',NULL,'2026-04-05 07:01:32'),(10,6,6,800.00,'Consultation','Pending',NULL,'2026-04-05 07:39:49'),(11,2,7,1000.00,'Consultation','Paid',NULL,'2026-04-05 07:39:56'),(12,1,8,1000.00,'Consultation','Pending',NULL,'2026-04-18 15:27:52'),(13,1,1,1500.00,'Consultation','Paid',NULL,'2026-04-19 14:52:18'),(14,2,2,2200.00,'Consultation','Pending',NULL,'2026-04-19 14:52:18'),(15,3,3,800.00,'Consultation','Paid','CLM-2024-001','2026-04-19 14:52:18'),(16,4,4,3500.00,'Consultation','Claimed','CLM-2024-002','2026-04-19 14:52:18'),(17,5,5,650.00,'Consultation','Pending',NULL,'2026-04-19 14:52:18'),(18,6,6,1200.00,'Consultation','Paid',NULL,'2026-04-19 14:52:18'),(19,7,7,4800.00,'Consultation','Claimed','CLM-2024-003','2026-04-19 14:52:18'),(20,1,8,950.00,'Consultation','Pending',NULL,'2026-04-19 14:52:18'),(21,3,9,7500.00,'Consultation','Pending',NULL,'2026-04-19 14:52:18'),(22,2,10,1100.00,'Consultation','Paid',NULL,'2026-04-19 14:52:18'),(23,5,14,1000.00,'Consultation','Pending',NULL,'2026-04-24 00:12:56'),(24,2,19,1000.00,'Consultation','Pending',NULL,'2026-04-24 10:43:44');
/*!40000 ALTER TABLE `Bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Doctor`
--

DROP TABLE IF EXISTS `Doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Doctor` (
  `doctor_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `specialty` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('Physician','Nurse','Specialist','Staff') NOT NULL,
  `schedule` text,
  `is_available` tinyint(1) DEFAULT '1',
  `unavailable_reason` varchar(100) DEFAULT NULL,
  `next_available` datetime DEFAULT NULL,
  PRIMARY KEY (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Doctor`
--

LOCK TABLES `Doctor` WRITE;
/*!40000 ALTER TABLE `Doctor` DISABLE KEYS */;
INSERT INTO `Doctor` VALUES (1,'Anil','Sharma','Cardiology','9876543210','anil.sharma@hospital.com','Physician',NULL,1,NULL,NULL),(2,'Priya','Mehta','Neurology','9876543211','priya.mehta@hospital.com','Specialist',NULL,0,'In Surgery','2026-04-05 15:00:00'),(3,'Ravi','Kapoor','Orthopedics','9876543212','ravi@hospital.com','Specialist',NULL,1,'On Leave','2026-04-07 09:00:00'),(4,'Sunita','Das','General','9876543213','sunita.das@hospital.com','Physician',NULL,1,NULL,NULL),(5,'Aryan','Bose','Dermatology','9876543214','aryan.bose@hospital.com','Specialist',NULL,1,NULL,NULL),(6,'Sunita','Rao','Pediatrics','9811111111','sunita.rao@hms.com','Physician',NULL,1,NULL,NULL),(7,'Vikram','Bose','Orthopedics','9822222222','vikram.bose@hms.com','Physician',NULL,1,NULL,NULL),(8,'Meena','Krishnan','Dermatology','9833333333','meena.krishnan@hms.com','Physician',NULL,1,NULL,NULL),(9,'Rakesh','Gupta','Neurology','9844444444','rakesh.gupta@hms.com','Physician',NULL,0,NULL,NULL),(10,'Ananya','Iyer','Oncology','9855555555','ananya.iyer@hms.com','Physician',NULL,1,NULL,NULL),(11,'Suresh','Pillai','Radiology','9866666666','suresh.pillai@hms.com','Physician',NULL,1,NULL,NULL),(12,'Pooja','Malhotra','Psychiatry','9877777777','pooja.malhotra@hms.com','Physician',NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `Doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EHR`
--

DROP TABLE IF EXISTS `EHR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EHR` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `diagnosis` text,
  `treatment` text,
  `allergies` text,
  `medical_history` text,
  `record_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `ehr_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `ehr_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `Doctor` (`doctor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EHR`
--

LOCK TABLES `EHR` WRITE;
/*!40000 ALTER TABLE `EHR` DISABLE KEYS */;
INSERT INTO `EHR` VALUES (1,1,1,'Hypertension Stage 1','Amlodipine 5mg daily','Penicillin','Family history of heart disease','2026-04-05 06:50:55'),(2,2,2,'Chronic Migraine','Sumatriptan 50mg as needed','None','Migraines since age 20','2026-04-05 06:50:55'),(3,3,3,'Ligament tear - left knee','Physiotherapy + rest 4 weeks','Ibuprofen','Previous ACL injury 2019','2026-04-05 06:50:55'),(4,4,1,'Hypertension Stage 2','Losartan 50mg daily','Penicillin','Diabetic, on insulin','2026-04-05 06:50:55'),(5,5,4,'Viral fever','Paracetamol 500mg + rest','Sulfa drugs','No major history','2026-04-05 06:50:55'),(6,6,5,'Contact dermatitis','Hydrocortisone cream 1%','Latex','Sensitive skin history','2026-04-05 06:50:55'),(8,9,1,'Hyperextension','Medicine','','','2026-04-23 18:30:00');
/*!40000 ALTER TABLE `EHR` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EmergencyCase`
--

DROP TABLE IF EXISTS `EmergencyCase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EmergencyCase` (
  `emergency_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `patient_name` varchar(100) DEFAULT NULL,
  `severity` enum('Critical','High','Medium','Low') NOT NULL,
  `description` text,
  `assigned_room` int DEFAULT NULL,
  `assigned_doctor` int DEFAULT NULL,
  `status` enum('Waiting','Admitted','Stabilized','Discharged') DEFAULT 'Waiting',
  `arrived_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`emergency_id`),
  KEY `patient_id` (`patient_id`),
  KEY `assigned_room` (`assigned_room`),
  KEY `assigned_doctor` (`assigned_doctor`),
  CONSTRAINT `emergencycase_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `emergencycase_ibfk_2` FOREIGN KEY (`assigned_room`) REFERENCES `Room` (`room_id`),
  CONSTRAINT `emergencycase_ibfk_3` FOREIGN KEY (`assigned_doctor`) REFERENCES `Doctor` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EmergencyCase`
--

LOCK TABLES `EmergencyCase` WRITE;
/*!40000 ALTER TABLE `EmergencyCase` DISABLE KEYS */;
INSERT INTO `EmergencyCase` VALUES (1,3,NULL,'Critical','Severe chest pain, suspected cardiac arrest',3,1,'Admitted','2026-04-05 07:51:11'),(2,NULL,'Arjun Rampal','High','Hearth Attack',11,4,'Admitted','2026-04-19 14:42:36'),(3,NULL,'Rahul Tiwari','Critical','Chest pain and shortness of breath',18,1,'Discharged','2026-04-19 14:48:53'),(4,NULL,'Sunita Devi','High','Head injury from road accident',NULL,2,'Waiting','2026-04-19 14:48:53'),(5,NULL,'Mohammad Ali','Medium','High fever and convulsions',19,3,'Stabilized','2026-04-19 14:48:53'),(6,NULL,'Geeta Bai','Low','Minor fracture in left arm',NULL,4,'Waiting','2026-04-19 14:48:53'),(7,NULL,'Karan Johar','High','Severe abdominal pain',NULL,1,'Admitted','2026-04-19 14:48:53'),(8,NULL,'Barack Obama','Critical','Knee Pain',4,6,'Admitted','2026-04-24 10:26:04');
/*!40000 ALTER TABLE `EmergencyCase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Inventory`
--

DROP TABLE IF EXISTS `Inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category` enum('Medicine','Equipment','Consumable','PPE') NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `unit` varchar(20) DEFAULT NULL,
  `min_threshold` int DEFAULT '10',
  `supplier` varchar(100) DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Inventory`
--

LOCK TABLES `Inventory` WRITE;
/*!40000 ALTER TABLE `Inventory` DISABLE KEYS */;
INSERT INTO `Inventory` VALUES (1,'Paracetamol 500mg','Medicine',200,'strips',50,'MedSupply Co.','2026-04-05 07:52:30'),(2,'Surgical Gloves','PPE',500,'pairs',100,'SafeGear Ltd.','2026-04-05 07:52:30'),(3,'Saline IV 500ml','Medicine',80,'bottles',30,'PharmaCare','2026-04-05 07:52:30'),(4,'Blood Pressure Cuff','Equipment',15,'units',5,'MediEquip','2026-04-05 07:52:30'),(5,'Syringes 5ml','Consumable',300,'pcs',100,'MedSupply Co.','2026-04-05 07:52:30'),(6,'N95 Masks','PPE',15,'pcs',20,'SafeGear Ltd.','2026-04-18 15:29:11'),(7,'Eye Drops','Medicine',14,'pcs',10,NULL,'2026-04-19 14:41:31'),(25,'Paracetamol 500mg','Medicine',500,'tablets',100,NULL,'2026-04-19 14:50:39'),(26,'Amoxicillin 250mg','Medicine',200,'capsules',50,NULL,'2026-04-19 14:50:39'),(27,'Insulin Glargine','Medicine',80,'vials',30,NULL,'2026-04-19 14:50:39'),(28,'IV Saline 500ml','Medicine',150,'bags',40,NULL,'2026-04-19 14:50:39'),(29,'Surgical Gloves (M)','PPE',1000,'pairs',200,NULL,'2026-04-19 14:50:39'),(30,'N95 Masks','PPE',300,'pcs',100,NULL,'2026-04-19 14:50:39'),(31,'Surgical Gowns','PPE',120,'pcs',50,NULL,'2026-04-19 14:50:39'),(32,'Syringes 5ml','Consumable',800,'pcs',150,NULL,'2026-04-19 14:50:39'),(33,'Bandage Rolls','Consumable',250,'rolls',60,NULL,'2026-04-19 14:50:39'),(34,'Gauze Pads','Consumable',400,'pcs',80,NULL,'2026-04-19 14:50:39'),(35,'Scalpel Blades','Consumable',15,'pcs',20,NULL,'2026-04-19 14:50:39'),(36,'Suture Kit','Consumable',8,'kits',15,NULL,'2026-04-19 14:50:39'),(37,'BP Monitor','Equipment',12,'units',5,NULL,'2026-04-19 14:50:39'),(38,'Pulse Oximeter','Equipment',18,'units',5,NULL,'2026-04-19 14:50:39'),(39,'Thermometer Digital','Equipment',25,'units',10,NULL,'2026-04-19 14:50:39'),(40,'Wheelchair','Equipment',3,'units',5,NULL,'2026-04-19 14:50:39'),(41,'Oxygen Cylinder','Equipment',6,'units',8,NULL,'2026-04-19 14:50:39');
/*!40000 ALTER TABLE `Inventory` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `low_stock_alert` AFTER UPDATE ON `inventory` FOR EACH ROW BEGIN
    IF NEW.quantity < NEW.min_threshold AND OLD.quantity >= OLD.min_threshold THEN
        INSERT INTO Notification(message, type)
        VALUES (CONCAT('LOW STOCK ALERT: ', NEW.item_name,
                ' has only ', NEW.quantity, ' ', NEW.unit, ' left! Contact: ', NEW.supplier),
                'Alert');
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `LabTest`
--

DROP TABLE IF EXISTS `LabTest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LabTest` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `record_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `test_name` varchar(100) NOT NULL,
  `result` text,
  `test_date` date NOT NULL,
  PRIMARY KEY (`test_id`),
  KEY `record_id` (`record_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `labtest_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `EHR` (`record_id`) ON DELETE CASCADE,
  CONSTRAINT `labtest_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LabTest`
--

LOCK TABLES `LabTest` WRITE;
/*!40000 ALTER TABLE `LabTest` DISABLE KEYS */;
INSERT INTO `LabTest` VALUES (1,1,1,'ECG','Mild LVH detected','2026-03-10'),(2,1,1,'Blood Pressure','150/95 mmHg','2026-03-10'),(3,2,2,'MRI Brain','No structural abnormality','2026-03-13'),(4,3,3,'X-Ray Left Knee','Ligament tear confirmed','2026-03-15'),(5,4,4,'HbA1c','8.2% - Poor control','2026-04-01'),(6,5,5,'CBC','WBC slightly elevated','2026-04-05');
/*!40000 ALTER TABLE `LabTest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Medication`
--

DROP TABLE IF EXISTS `Medication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Medication` (
  `medication_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `dosage_form` varchar(50) DEFAULT NULL,
  `interactions` text,
  `contraindications` text,
  PRIMARY KEY (`medication_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Medication`
--

LOCK TABLES `Medication` WRITE;
/*!40000 ALTER TABLE `Medication` DISABLE KEYS */;
INSERT INTO `Medication` VALUES (1,'Amlodipine','Tablet 5mg','Simvastatin increases toxicity','Severe hypotension'),(2,'Sumatriptan','Tablet 50mg','MAO inhibitors — avoid','Ischemic heart disease'),(3,'Losartan','Tablet 50mg','NSAIDs reduce effectiveness','Pregnancy'),(4,'Paracetamol','Tablet 500mg','Warfarin — increased bleeding risk','Severe liver disease'),(5,'Hydrocortisone','Cream 1%','None significant','Fungal skin infections'),(6,'Metformin','Tablet 500mg','Alcohol increases lactic acidosis','Kidney disease');
/*!40000 ALTER TABLE `Medication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notification` (
  `notif_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('Appointment','Lab','Bill','Alert') NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notif_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `Doctor` (`doctor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
INSERT INTO `Notification` VALUES (1,6,5,'Your appointment is complete. Bill generated.','Appointment',1,'2026-04-05 07:26:49'),(2,2,1,'Your appointment is complete. Bill generated.','Appointment',1,'2026-04-05 07:39:56'),(3,3,1,'EMERGENCY: Critical case admitted. Room assigned.','Alert',1,'2026-04-05 07:51:11'),(4,NULL,NULL,'LOW STOCK ALERT: N95 Masks has only 5 pcs left! Contact: SafeGear Ltd.','Alert',1,'2026-04-05 07:52:44'),(5,1,3,'Your appointment is complete. Bill generated.','Appointment',1,'2026-04-18 15:27:52'),(6,NULL,NULL,'LOW STOCK ALERT: N95 Masks has only 15 pcs left! Contact: SafeGear Ltd.','Alert',1,'2026-04-18 15:29:11'),(7,5,5,'Your appointment is complete. Bill generated.','Appointment',0,'2026-04-24 00:12:56'),(8,2,9,'Your appointment is complete. Bill generated.','Appointment',0,'2026-04-24 10:43:44');
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Patient`
--

DROP TABLE IF EXISTS `Patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patient` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `gender` enum('M','F','Other') NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `insurance_id` varchar(50) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  KEY `idx_patient_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Patient`
--

LOCK TABLES `Patient` WRITE;
/*!40000 ALTER TABLE `Patient` DISABLE KEYS */;
INSERT INTO `Patient` VALUES (1,'Saransh','Agarwal','1989-12-31','M','9999999999','test@test.com','Delhi','INS1','9888888888','2026-04-05 06:50:47'),(2,'Sneha','Gupta','1988-07-22','F','9123456781','sneha.gupta@gmail.com','Mumbai','INS002','Dad: 9000000002','2026-04-05 06:50:47'),(3,'Arjun','Singh','2000-01-15','M','9123456782','arjun.singh@gmail.com','Noida','INS003','Wife: 9000000003','2026-04-05 06:50:47'),(4,'Meera','Joshi','1975-11-05','F','9123456783','meera.joshi@gmail.com','Pune','INS004','Son: 9000000004','2026-04-05 06:50:47'),(5,'Karan','Malhotra','1992-06-18','M','9123456784','karan.m@gmail.com','Lucknow','INS005','Sis: 9000000005','2026-04-05 06:50:47'),(6,'Anjali','Rao','1983-09-30','F','9123456785','anjali.rao@gmail.com','Hyderabad','INS006','Bro: 9000000006','2026-04-05 06:50:47'),(7,'Tom','Cruise','1982-09-20','M','9898989898','hehe@gmail.com','Noida','','Rahul','2026-04-18 14:16:30'),(9,'Priya','Sharma','1992-03-15','F','9811234567','priya.sharma@gmail.com','12 MG Road, Delhi','INS-2021','9811234568','2026-04-19 14:48:53'),(10,'Arjun','Mehta','1985-07-22','M','9822345678','arjun.mehta@gmail.com','45 Park Street, Mumbai','INS-2022','9822345679','2026-04-19 14:48:53'),(11,'Sneha','Patel','1998-11-05','F','9833456789','sneha.patel@gmail.com','78 Ring Road, Ahmedabad','INS-2023','9833456780','2026-04-19 14:48:53'),(12,'Rohit','Verma','1979-01-30','M','9844567890','rohit.verma@gmail.com','23 Civil Lines, Lucknow','INS-2024','9844567891','2026-04-19 14:48:53'),(13,'Kavya','Nair','2001-06-18','F','9855678901','kavya.nair@gmail.com','56 Beach Road, Kochi','INS-2025','9855678902','2026-04-19 14:48:53'),(14,'Amit','Singh','1990-09-12','M','9866789012','amit.singh@gmail.com','34 Sector 15, Noida','INS-2026','9866789013','2026-04-19 14:48:53'),(15,'Divya','Reddy','1995-04-25','F','9877890123','divya.reddy@gmail.com','89 Banjara Hills, Hyderabad','INS-2027','9877890124','2026-04-19 14:48:53');
/*!40000 ALTER TABLE `Patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Prescription`
--

DROP TABLE IF EXISTS `Prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prescription` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `medication_id` int NOT NULL,
  `dosage_instructions` text,
  `prescribed_date` date NOT NULL,
  `refill_count` int DEFAULT '0',
  PRIMARY KEY (`prescription_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `medication_id` (`medication_id`),
  CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `Doctor` (`doctor_id`) ON DELETE CASCADE,
  CONSTRAINT `prescription_ibfk_3` FOREIGN KEY (`medication_id`) REFERENCES `Medication` (`medication_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Prescription`
--

LOCK TABLES `Prescription` WRITE;
/*!40000 ALTER TABLE `Prescription` DISABLE KEYS */;
INSERT INTO `Prescription` VALUES (1,1,1,1,'Once daily after breakfast','2026-03-10',2),(2,2,2,2,'Take when migraine starts, max 2/day','2026-03-12',1),(3,3,3,4,'Twice daily after food for 5 days','2026-03-15',0),(4,4,1,3,'Once daily at night','2026-04-01',3),(5,4,1,6,'Twice daily with meals','2026-04-01',3),(6,5,4,4,'Three times a day for 3 days','2026-04-05',0),(7,7,1,4,'aksd','2026-04-18',1);
/*!40000 ALTER TABLE `Prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Room`
--

DROP TABLE IF EXISTS `Room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Room` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) NOT NULL,
  `floor` int NOT NULL,
  `ward_type` enum('ICU','General','Emergency','Private') NOT NULL,
  `is_occupied` tinyint(1) DEFAULT '0',
  `patient_id` int DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `room_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patient` (`patient_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Room`
--

LOCK TABLES `Room` WRITE;
/*!40000 ALTER TABLE `Room` DISABLE KEYS */;
INSERT INTO `Room` VALUES (1,'ICU-01',1,'ICU',1,1),(2,'ICU-02',1,'ICU',1,2),(3,'ICU-03',1,'ICU',1,3),(4,'ICU-04',1,'ICU',1,NULL),(5,'G-01',2,'General',1,3),(6,'G-02',2,'General',1,4),(7,'G-03',2,'General',0,NULL),(8,'G-04',2,'General',0,NULL),(9,'G-05',2,'General',0,NULL),(10,'E-01',1,'Emergency',1,5),(11,'E-02',1,'Emergency',1,NULL),(12,'P-01',3,'Private',1,6),(13,'P-02',3,'Private',0,NULL),(14,'P-03',3,'Private',0,NULL),(15,'G101',1,'General',0,NULL),(16,'G102',1,'General',0,NULL),(17,'G103',1,'General',0,NULL),(18,'ICU01',2,'ICU',1,NULL),(19,'ICU02',2,'ICU',1,NULL),(20,'P201',2,'Private',0,NULL),(21,'P202',2,'Private',0,NULL);
/*!40000 ALTER TABLE `Room` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `discharge_room` AFTER UPDATE ON `room` FOR EACH ROW BEGIN
    IF NEW.is_occupied = FALSE THEN
        UPDATE Room SET patient_id = NULL WHERE room_id = NEW.room_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `todayschedule`
--

DROP TABLE IF EXISTS `todayschedule`;
/*!50001 DROP VIEW IF EXISTS `todayschedule`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `todayschedule` AS SELECT 
 1 AS `Doctor`,
 1 AS `specialty`,
 1 AS `Patient`,
 1 AS `appointment_date`,
 1 AS `status`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `todayschedule`
--

/*!50001 DROP VIEW IF EXISTS `todayschedule`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `todayschedule` AS select `d`.`first_name` AS `Doctor`,`d`.`specialty` AS `specialty`,`p`.`first_name` AS `Patient`,`a`.`appointment_date` AS `appointment_date`,`a`.`status` AS `status` from ((`appointment` `a` join `doctor` `d` on((`a`.`doctor_id` = `d`.`doctor_id`))) join `patient` `p` on((`a`.`patient_id` = `p`.`patient_id`))) where (cast(`a`.`appointment_date` as date) = curdate()) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10 17:53:45
