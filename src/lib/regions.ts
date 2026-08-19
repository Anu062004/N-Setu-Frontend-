/**
 * State → district classification (districts grouped under their state).
 * Bihar is listed in full (the primary demo jurisdiction); other states list
 * their districts so classification is state-wise everywhere the product runs.
 */
export const REGIONS: Record<string, string[]> = {
  Bihar: [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
    "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia",
    "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi",
    "Siwan", "Supaul", "Vaishali", "West Champaran",
  ],
  Jharkhand: [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
    "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma",
    "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj",
    "Seraikela-Kharsawan", "Simdega", "West Singhbhum",
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Ayodhya", "Azamgarh", "Bareilly", "Basti", "Bijnor",
    "Bulandshahr", "Deoria", "Etawah", "Farrukhabad", "Firozabad", "Ghaziabad",
    "Ghazipur", "Gonda", "Gorakhpur", "Hapur", "Jaunpur", "Jhansi", "Kanpur",
    "Kushinagar", "Lakhimpur Kheri", "Lucknow", "Mathura", "Meerut", "Mirzapur",
    "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli",
    "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur",
    "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi",
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong",
    "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas",
    "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur",
    "Purulia", "South 24 Parganas", "Uttar Dinajpur",
  ],
  Delhi: [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi",
    "South West Delhi", "West Delhi",
  ],
  Maharashtra: [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
    "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
    "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal",
  ],
  Karnataka: [
    "Bagalkot", "Ballari", "Bengaluru Rural", "Bengaluru Urban", "Bidar",
    "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura",
  ],
  "Tamil Nadu": [
    "Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
    "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri",
    "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur",
    "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur",
    "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Vellore", "Viluppuram",
    "Virudhunagar",
  ],
  Kerala: [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
    "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram",
    "Thrissur", "Wayanad",
  ],
  Telangana: [
    "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon",
    "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
    "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial",
    "Medak", "Medchal-Malkajgiri", "Nagarkurnool", "Nalgonda", "Nirmal",
    "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy",
    "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal",
  ],
  "Andhra Pradesh": [
    "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool",
    "Prakasam", "Srikakulam", "Sri Sathya Sai", "Visakhapatnam", "Vizianagaram",
    "West Godavari", "YSR Kadapa",
  ],
  Odisha: [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
    "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh",
  ],
  Assam: [
    "Baksa", "Barpeta", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji",
    "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi",
    "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong",
    "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon",
    "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri",
  ],
  Punjab: [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka",
    "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana",
    "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur",
    "SAS Nagar", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran",
  ],
  Gujarat: [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
    "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar",
    "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahisagar",
    "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar",
    "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad",
  ],
  Rajasthan: [
    "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara",
    "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur",
    "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar",
    "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh",
    "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur",
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani",
    "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh",
    "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda",
    "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone",
    "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen",
    "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol",
    "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain",
    "Umaria", "Vidisha",
  ],
  Chhattisgarh: [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur",
    "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa",
    "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund",
    "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma",
    "Surajpur", "Surguja",
  ],
  Haryana: [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram",
    "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra",
    "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak",
    "Sirsa", "Sonipat", "Yamunanagar",
  ],
};

export const STATES = Object.keys(REGIONS);

export function districtsFor(state: string): string[] {
  return REGIONS[state] ?? [];
}

export function stateForDistrict(district: string): string | null {
  for (const [state, districts] of Object.entries(REGIONS)) {
    if (districts.includes(district)) return state;
  }
  return null;
}