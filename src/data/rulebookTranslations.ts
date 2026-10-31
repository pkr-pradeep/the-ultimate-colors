import { RulebookLanguage } from '../utils/firstTimeUser';

export interface RuleSection {
  title: string;
  points: string[];
}

export interface RulebookContent {
  headerBadge: string;
  title: string;
  subtitle: string;
  jokerTitle: string;
  jokerDesc: string;
  jokerTagline: string;
  sections: RuleSection[];
  returnButton: string;
}

export const RULEBOOK_TRANSLATIONS: Record<RulebookLanguage, RulebookContent> = {
  // ================= ENGLISH =================
  en: {
    headerBadge: 'Official Playbook',
    title: 'THE UNIVERSAL JOKER',
    subtitle: 'Official Rulebook & Playbook · 4-Player Custom Trick-Taking Partnership Card Game',
    jokerTitle: 'The Dadaji Universal Joker (ଜୋକର୍ / जोकर)',
    jokerDesc: 'Preserved in his imperial maroon-and-gold sherwani, white flowing beard, curled aristocratic moustache, and gold walking cane, Dadaji is the supreme authority on the table.',
    jokerTagline: 'Universal Trump: Outranks every card, sitting strictly above the Ace of Trump (Tricks 2–12)!',
    sections: [
      {
        title: 'SECTION 1: GAME OVERVIEW & MATCH MODES',
        points: [
          '4 players in two fixed partnerships: Team 1 (South [You] & North [Hriday]) vs Team 2 (East & West). Partners sit directly across each other.',
          'Default Point Mode (Survival): First team to reach or exceed 100 points wins the match.',
          'Custom Point Mode: Reach a customized point target (e.g., 50 or 60 points) to claim victory.',
          'Time Mode (Blitz): Strict countdown timer (e.g., 30 minutes). The team with the highest score when the ongoing hand finishes wins.',
        ],
      },
      {
        title: 'SECTION 2: SUIT & JOKER NOMENCLATURE',
        points: [
          'Clubs (♣): English: Clubs | Odia: ଚିଡ଼ିଆ (Chidia) | Hindi: चिडि (Chidi)',
          'Hearts (♥): English: Hearts | Odia: ଲାଲ୍ ପାନ୍ (Lal Pan) | Hindi: पान (Pan)',
          'Spades (♠): English: Spades | Odia: କଳା ପାନ୍ (Kala Pan) | Hindi: हुकुम (Hukum)',
          'Diamond (♦): English: Diamond | Odia: ଠିକିରି (Thikiri) | Hindi: ईट (Eent)',
          'Joker (★): English: Joker (Dadaji) | Odia: ଜୋକର୍ | Hindi: जोकर',
          'Two of Spades (କଳା ପାନ୍ ଦୁଇ / हुकुम की दुक्की) is permanently excluded from the deck and never dealt.',
        ],
      },
      {
        title: 'SECTION 3: SETUP, SHUFFLE & HAND PLAYABILITY',
        points: [
          '52-Card Playable Deck: 53 cards in total (standard 52 + 1 Dadaji Joker). Two of Spades (କଳା ପାନ୍ ଦୁଇ) is permanently removed.',
          'Counter-Clockwise Dealing: 13 cards are dealt counter-clockwise to each of the 4 players, starting with the player to the right of the dealer.',
          '52nd Card Trump Reveal: The final dealt card (to the dealer) is turned face-up to establish the Trump suit. If the 52nd card is the Joker, no permanent trump is active—all suits are equal!',
          'Hand Playability Rule: Every player MUST hold at least one qualifying card: a Face card (A, K, Q, J), a Trump card, or the Dadaji Joker. If any player has none of these, the deal is unplayable and cards are automatically reshuffled and redealt!',
        ],
      },
      {
        title: 'SECTION 4: BIDDING & THE 6-BID THRESHOLD',
        points: [
          'Individual Bids: Each player bids 0 to 13 tricks based on hand strength.',
          'Team Minimum 2 Tricks: A team cannot bid 0 (Nil) or 1 trick. If both partners bid 0, the team bid defaults to 2.',
          'Minimum 6-Bid Reshuffle Rule: If neither team bids 6 or more (i.e. both Team 1 and Team 2 bids are below 6), play will NOT happen. Cards are automatically gathered, reshuffled, and dealt by the next dealer without score penalties.',
        ],
      },
      {
        title: 'SECTION 5: DADAJI JOKER RULES & TRICK PLAY',
        points: [
          'First Round Ban (Trick 1): The Joker is strictly denied during Trick 1. It cannot be led or played.',
          'Free Strike (Tricks 2–13): Players can play the Joker at ANY time during rounds 2 to 13, even if they hold cards of the led suit!',
          'Starting a Trick with Joker: A player is allowed to lead with the Joker; if led, it counts only as Two of Spades (କଳା ପାନ୍ ଦୁଇ / 2♠).',
          'Trick 13 Demotion: In the final 13th round, the Joker loses its supreme power and counts strictly as Two of Spades (କଳା ପାନ୍ ଦୁଇ).',
          'Must Follow Suit: Players must follow the led suit if held (unless playing the Joker in Tricks 2–13). If void, any card can be discarded or trumped.',
        ],
      },
      {
        title: 'SECTION 6: TACTICAL STRIKES & AI INTELLIGENCE',
        points: [
          'King-Rescue Strike: When an opponent drops an Ace over your King, fire the Dadaji Joker to kill the Ace and promote your King!',
          'Ace-Decapitation Strike: Decapitate the opponent\'s Trump Ace by dropping the Dadaji Joker at the highest leverage moment.',
          'Partner Protection: Never waste high trumps or the Joker if your partner is already winning the trick.',
        ],
      },
      {
        title: 'SECTION 7: ACCELERATION & "SHOW HAND" VERIFICATION',
        points: [
          'Early Round Skip: Once both teams have achieved their bids, only the human player (South) can choose to skip all remaining rounds to conclude the hand immediately.',
          'Show Hand (Claim Contract): When opponents have met their bid and your team still needs tricks, South can claim the hand by selecting their winning cards.',
          'Mathematical Verification: The system verifies whether your selected cards are 100% unassailable winners against all remaining opponent cards.',
          'Strict Penalty on Failed Show: If verification fails, a strict penalty is assessed: Total Score − Current Bid (deducting the bid directly from your match score).',
        ],
      },
      {
        title: 'SECTION 8: SCORING MATRIX',
        points: [
          'Normal Contracts (Bids 2–9): Meeting bid scores +bid points (e.g. bid 5, win 6 => +5 pts). Overtricks award no extra points. Failing scores -bid points.',
          'High Contracts (Bids 10–13): Successfully winning 10+ tricks earns double points (e.g. bid 10 => +20 pts; bid 13 => +26 pts).',
          '13-Trick "Boston" Sweep: Winning all 13 tricks awards +26 points and forces a penalty on opponents.',
        ],
      },
    ],
    returnButton: 'Return to Table',
  },

  // ================= HINDI (हिंदी) =================
  hi: {
    headerBadge: 'आधिकारिक नियमावली',
    title: 'द यूनिवर्सल जोकर',
    subtitle: 'आधिकारिक नियम पुस्तिका · 4 खिलाड़ियों का साझेदारी वाला अनूठा ताश खेल',
    jokerTitle: 'दादाजी यूनिवर्सल जोकर',
    jokerDesc: 'शाही महरून-सुनहरी शेरवानी, सफेद दाढ़ी, राजसी मूछों और सुनहरी छड़ी वाले दादाजी ताश के मेज पर सर्वोच्च सत्ता हैं।',
    jokerTagline: 'यूनिवर्सल तुरुप: तुरुप के इक्के से भी ऊपर, हर पत्ते को मात देने वाला सर्वोच्च पत्ता (राउंड 2–12)!',
    sections: [
      {
        title: 'अध्याय 1: खेल का परिचय एवं मैच मोड',
        points: [
          '4 खिलाड़ी और 2 निश्चित टीमें: टीम 1 (दक्षिण [आप] और उत्तर [हृदय]) बनाम टीम 2 (पूर्व और पश्चिम)। साथी खिलाड़ी आमने-सामने बैठते हैं।',
          'डिफ़ॉल्ट अंक मोड (100 अंक): जो टीम सबसे पहले 100 अंक बनाती है, वह मैच जीतती है।',
          'कस्टम अंक मोड: खिलाड़ी अपनी पसंद का लक्ष्य (जैसे 50 या 60 अंक) तय कर सकते हैं।',
          'समय मोड (ब्लिट्ज़): तय समय सीमा (जैसे 30 मिनट)। समय समाप्त होने पर चल रहा हाथ पूरा होने के बाद सर्वाधिक अंक वाली टीम विजयी होती है।',
        ],
      },
      {
        title: 'अध्याय 2: पत्तों के रंग एवं जोकर के आधिकारिक नाम (Nomenclature)',
        points: [
          'चिडि (Clubs ♣): हिंदी: चिडि | अंग्रेजी: Clubs | ओड़िया: ଚିଡ଼ିଆ',
          'पान (Hearts ♥): हिंदी: पान | अंग्रेजी: Hearts | ओड़िया: ଲାଲ୍ ପାନ୍',
          'हुकुम (Spades ♠): हिंदी: हुकुम | अंग्रेजी: Spades | ओड़िया: କଳା ପାନ୍',
          'ईट (Diamond ♦): हिंदी: ईट | अंग्रेजी: Diamond | ओड़िया: ଠିକିରି',
          'जोकर (Joker ★): हिंदी: जोकर | अंग्रेजी: Joker | ओड़िया: ଜୋକର୍',
          'हुकुम की दुक्की (Two of Spades / କଳା ପାନ୍ ଦୁଇ) को खेल के डेक से स्थायी रूप से हटा दिया गया है।',
        ],
      },
      {
        title: 'अध्याय 3: पत्तों का वितरण एवं खेल-योग्यता नियम',
        points: [
          '52 पत्तों का खेल डेक: कुल 53 पत्ते (52 सामान्य + 1 दादाजी जोकर)। हुकुम की दुक्की खेल से हमेशा के लिए बाहर रहती है।',
          'वामावर्त (घड़ी के उल्टे) वितरण: प्रत्येक खिलाड़ी को 13-13 पत्ते बांटे जाते हैं, शुरुआत बांटने वाले (डीलर) के दाएं हाथ के खिलाड़ी से होती है।',
          '52वां पत्ता तुरुप (Trump): डीलर को मिलने वाला 52वां पत्ता खोलकर दिखाया जाता है जो राउंड का तुरुप तय करता है। यदि यह पत्ता जोकर निकले, तो कोई स्थायी तुरुप नहीं रहता—सभी रंग (चिडि, पान, हुकुम, ईट) बराबर होते हैं!',
          'हाथ की खेल-योग्यता नियम: प्रत्येक खिलाड़ी के पास कम से कम एक फेस कार्ड (A, K, Q, J), या तुरुप, या जोकर होना अनिवार्य है। यदि किसी के पास इनमें से कोई पत्ता नहीं है, तो खेल नहीं हो सकता और पत्ते स्वतः दोबारा बांटे जाते हैं।',
        ],
      },
      {
        title: 'अध्याय 4: बोली (Bidding) और न्यूनतम 6-बोली नियम',
        points: [
          'व्यक्तिगत बोली: प्रत्येक खिलाड़ी अपने पत्तों के आधार पर 0 से 13 तक हाथ जीतने की बोली लगा सकता है।',
          'टीम की न्यूनतम बोली 2: किसी टीम की बोली 0 या 1 नहीं हो सकती। यदि दोनों साथी 0 बोलते हैं, तो टीम की बोली स्वतः 2 मानी जाती है।',
          'न्यूनतम 6-बोली रेशफल नियम: यदि दोनों टीमों में से किसी की भी बोली 6 या अधिक नहीं होती (दोनों टीमें 6 से कम पर रह जाती हैं), तो वह हाथ नहीं खेला जाएगा। पत्ते बिना किसी पेनल्टी के तुरंत दोबारा बांटे जाएंगे।',
        ],
      },
      {
        title: 'अध्याय 5: दादाजी जोकर खेलने के नियम',
        points: [
          'पहले राउंड में जोकर बंद (Trick 1): खेल के पहले राउंड में जोकर न तो चला जा सकता है और न ही उससे चाल शुरू की जा सकती है।',
          'राउंड 2 से 13 में जोकर का स्वतंत्र वार: राउंड 2 से 13 के दौरान आप कभी भी जोकर खेल सकते हैं, भले ही आपके पास उस रंग का पत्ता मौजूद हो!',
          'जोकर से चाल शुरू करना: यदि कोई खिलाड़ी जोकर से चाल शुरू करता है, तो वह हुकुम की दुक्की (2♠) मानी जाती है।',
          '13वें राउंड में जोकर की शक्ति समाप्त: अंतिम 13वें राउंड में जोकर अपनी सर्वोच्च शक्ति खो देता है और केवल हुकुम की दुक्की (2♠) बन जाता है।',
          'रंग चलना अनिवार्य: यदि आपके पास चली गई चाल के रंग का पत्ता है, तो वही चलना होगा (राउंड 2–13 में जोकर खेलने के अतिरिक्त)। रंग न होने पर कोई भी पत्ता या तुरुप फेंक सकते हैं।',
        ],
      },
      {
        title: 'अध्याय 6: सामरिक चालें एवं एआई चालाकियाँ',
        points: [
          'बादशाह बचाओ वार (King-Rescue): जब विरोधी आपके बादशाह (K) पर इक्का (A) फेंके, तो तुरंत जोकर मारकर इक्के का खात्मा करें और अपने बादशाह को सुरक्षित करें!',
          'तुरुप इक्का वध (Ace-Decapitation): विरोधी के तुरुप इक्के (Trump Ace) पर जोकर गिराकर उसके सबसे बड़े पत्ते को धूल चटाएं।',
          'साथी की सुरक्षा: यदि आपका साथी पहले से चाल जीत रहा हो, तो उस पर बड़ा पत्ता या जोकर बर्बाद न करें।',
        ],
      },
      {
        title: 'अध्याय 7: खेल तेजी एवं "शो हैंड" (हाथ दिखाना)',
        points: [
          'बाकी राउंड छोड़ना (Skip Rounds): जब दोनों टीमें अपनी-अपनी बोलियां पूरी कर लेती हैं, तो केवल मानव खिलाड़ी (आप) बचे हुए राउंड छोड़कर तुरंत हाथ समाप्त कर सकता है।',
          'शो हैंड (दावा करना): जब विरोधी अपनी बोली जीत चुके हों और आपकी टीम को और हाथ चाहिए हों, तो आप जीतने वाले पत्ते चुनकर दावा पेश कर सकते हैं।',
          'सिस्टम द्वारा जांच: खेल इंजन गणितीय रूप से जांचेगा कि आपके चुने पत्ते विरोधियों के बचे पत्तों के खिलाफ 100% अजेय हैं या नहीं।',
          'गलत दावे पर भारी जुर्माना: यदि दावा गलत निकलता है, तो कड़ा नियम लागू होगा: कुल स्कोर − वर्तमान बोली (अर्थात आपकी टीम के कुल स्कोर में से पूरी बोली के अंक कट जाएंगे)।',
        ],
      },
      {
        title: 'अध्याय 8: स्कोरिंग मैट्रिक्स',
        points: [
          'सामान्य बोली (2 से 9): बोली पूरी होने पर +बोली अंक (जैसे बोली 5 पर 6 हाथ जीते तो +5 अंक)। अधिक हाथ जीतने पर अतिरिक्त अंक नहीं मिलते। बोली न बनने पर -बोली अंक।',
          'बड़ी बोली (10 से 13): 10 या अधिक की बोली पूरी करने पर दोगुने अंक मिलते हैं (बोली 10 = +20 अंक, बोली 13 = +26 अंक)।',
          '13-हाथ बोस्टन स्वीप: सभी 13 हाथ जीतने पर +26 अंक मिलते हैं और विरोधी टीम पर पेनल्टी लगती है।',
        ],
      },
    ],
    returnButton: 'टेबल पर वापस जाएं',
  },

  // ================= ODIA (ଓଡ଼ିଆ) =================
  or: {
    headerBadge: 'ଆନୁଷ୍ଠାନିକ ତାସ୍ ନିୟମାବଳୀ',
    title: 'ଦ ୟୁନିଭର୍ସାଲ୍ ଜୋକର୍',
    subtitle: '୪ ଜଣିଆ ସହଭାଗୀ ତାସ୍ ଖେଳର ପୂର୍ଣ୍ଣାଙ୍ଗ ନିୟମ ଓ ରଣନୀତି ପୁସ୍ତିକା',
    jokerTitle: 'ଦାଦାଜୀ ୟୁନିଭର୍ସାଲ୍ ଜୋକର୍ (ଜୋକର୍)',
    jokerDesc: 'ରାଜକୀୟ ମେରୁନ୍-ସୁନେଲି ଶେରୱାନୀ, ଧବଳ ଦାଢ଼ି, ବୁଲାଣିଆ ରାଜସିକ ନିଶ ଓ ହାତରେ ସୁନା ବାଡ଼ି—ଏହି ତାସ୍ ଟେବୁଲ୍‌ରେ ଦାଦାଜୀ ହିଁ ଏକଚ୍ଛତ୍ର ସମ୍ରାଟ!',
    jokerTagline: 'ସର୍ବୋଚ୍ଚ ତୁରୁପ୍: ତୁରୁପ୍ ଟିକ୍କା (Ace) ଠାରୁ ବି ବଳିଷ୍ଠ—ଯେକୌଣସି ହାତକୁ କାବୁ କରିବାର ଅଖଣ୍ଡ ଶକ୍ତି (ରାଉଣ୍ଡ୍ ୨ ରୁ ୧୨)!',
    sections: [
      {
        title: 'ଅଧ୍ୟାୟ ୧: ଖେଳ ଶୈଳୀ ଓ ମ୍ୟାଚ୍ ଲକ୍ଷ୍ୟ',
        points: [
          '୪ ଜଣ ଖେଳାଳି ଓ ୨ଟି ସହଭାଗୀ ଦଳ: ଟିମ୍ ୧ (ଦକ୍ଷିଣ [ଆପଣ] ଓ ଉତ୍ତର [ଆପଣଙ୍କ ସାଥୀ ହୃଦୟ]) ବନାମ ଟିମ୍ ୨ (ପୂର୍ବ ଓ ପଶ୍ଚିମ)। ସାଥୀ ଖେଳାଳି ପରସ୍ପର ସାମ୍ନାସାମ୍ନି ବସି ଖେଳନ୍ତି।',
          'ସର୍ଭାଇଭାଲ୍ ପଏଣ୍ଟ୍ ମୋଡ୍ (୧୦୦ ପଏଣ୍ଟ୍): ଯେଉଁ ଦଳ ପ୍ରଥମେ ୧୦୦ ବା ତା’ଠାରୁ ଅଧିକ ପଏଣ୍ଟ୍ ହାସଲ କରିବେ, ସେହି ଦଳ ହିଁ ଚାମ୍ପିଅନ୍ ହେବ।',
          'କଷ୍ଟମ୍ ଟାର୍ଗେଟ୍ ମୋଡ୍: ନିଜ ପସନ୍ଦ ଅନୁସାରେ ୫୦ ବା ୬୦ ପଏଣ୍ଟ୍‌ର ଲକ୍ଷ୍ୟ ସ୍ଥିର କରି ମ୍ୟାଚ୍ ଆରମ୍ଭ କରନ୍ତୁ।',
          'ଟାଇମ୍ ବ୍ଲିଟ୍ଜ୍ ମୋଡ୍: ନିର୍ଦ୍ଧାରିତ ସମୟ ସୀମା (ଯଥା: ୩୦ ମିନିଟ୍)। ସମୟ ସରିବା ପରେ ଚାଲୁଥିବା ହାତ ଶେଷ ହେବା କ୍ଷଣି ସର୍ବାଧିକ ପଏଣ୍ଟ୍ ପାଇଥିବା ଦଳ ବିଜୟୀ ହୁଅନ୍ତି।',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୨: ତାସ୍ ରଙ୍ଗ ଓ ଜୋକର୍‌ର ପ୍ରକୃତ ନାମାବଳୀ',
        points: [
          'ଚିଡ଼ିଆ (Clubs ♣): ଓଡ଼ିଆରେ ଚିଡ଼ିଆ, ହିନ୍ଦୀରେ चिडि, ଇଂରାଜୀରେ Clubs।',
          'ଲାଲ୍ ପାନ୍ (Hearts ♥): ଓଡ଼ିଆରେ ଲାଲ୍ ପାନ୍, ହିନ୍ଦୀରେ पान, ଇଂରାଜୀରେ Hearts।',
          'କଳା ପାନ୍ (Spades ♠): ଓଡ଼ିଆରେ କଳା ପାନ୍, ହିନ୍ଦୀରେ हुकुम, ଇଂରାଜୀରେ Spades।',
          'ଠିକିରି (Diamond ♦): ଓଡ଼ିଆରେ ଠିକିରି, ହିନ୍ଦୀରେ ईट, ଇଂରାଜୀରେ Diamond।',
          'ଜୋକର୍ (Joker ★): ଓଡ଼ିଆରେ ଜୋକର୍, ହିନ୍ଦୀରେ जोकर, ଇଂରାଜୀରେ Joker (ଦାଦାଜୀ)।',
          'କଳା ପାନ୍ ଦୁଇ (Two of Spades): କଳା ପାନ୍ ଦୁଇକୁ ଡେକ୍‌ରୁ ସବୁଦିନ ପାଇଁ ବାହାର କରିଦିଆଯାଇଛି, ଏହା କେବେ ବି ଖେଳରେ ବଣ୍ଟାଯାଏ ନାହିଁ।',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୩: ତାସ୍ ବଣ୍ଟନ ଓ ହାତର ଖେଳ ଯୋଗ୍ୟତା',
        points: [
          '୫୨ ଖଣ୍ଡ ତାସ୍‌ର ଖେଳ: ମୋଟ୍ ୫୩ ଖଣ୍ଡ (୫୨ ସାଧାରଣ + ୧ ଦାଦାଜୀ ଜୋକର୍) ମଧ୍ୟରୁ କଳା ପାନ୍ ଦୁଇ ବାଦ୍ ପଡ଼ି ପ୍ରକୃତରେ ୫୨ ଖଣ୍ଡ ତାସ୍ ଖେଳାଯାଏ।',
          'ଡାହାଣ କ୍ରମରେ ବଣ୍ଟନ: ଘଣ୍ଟା କଣ୍ଟାର ଓଲଟା ଦିଗରେ (Counter-Clockwise) ପ୍ରତ୍ୟେକଙ୍କୁ ୧୩ ଖଣ୍ଡ ଲେଖାଏଁ ତାସ୍ ବଣ୍ଟାଯାଏ, ବଣ୍ଟନକାରୀ (ଡିଲର୍) ଙ୍କ ଡାହାଣ ପାଖରୁ ଖେଳ ଆରମ୍ଭ ହୁଏ।',
          '୫୨ତମ ତାସ୍‌ରୁ ତୁରୁପ୍ ନିର୍ଣ୍ଣୟ: ଡିଲର୍‌ଙ୍କ ହାତକୁ ଆସୁଥିବା ଶେଷ (୫୨ତମ) ତାସ୍‌ଟି ସମସ୍ତଙ୍କ ସାମ୍ନାରେ ଖୋଲାଯାଇ ତୁରୁପ୍ ରଙ୍ଗ ସ୍ଥିର ହୁଏ। ଯଦି ସେହି ତାସ୍ ଜୋକର୍ ବାହାରେ, ତେବେ କୌଣସି ରଙ୍ଗ ତୁରୁପ୍ ରହେନାହିଁ—ଚିଡ଼ିଆ, ଲାଲ୍ ପାନ୍, କଳା ପାନ୍ ଓ ଠିକିରି ସବୁ ସମାନ ହୋଇଯାଏ!',
          'ଅନିବାର୍ଯ୍ୟ ଖେଳ ଯୋଗ୍ୟତା ନିୟମ: ପ୍ରତ୍ୟେକ ଖେଳାଳିଙ୍କ ହାତରେ ଅନ୍ତତଃ ଗୋଟିଏ ହେଲେ ବଡ଼ ପତ୍ର (A, K, Q, J), କିମ୍ବା ଗୋଟିଏ ତୁରୁପ୍, କିମ୍ବା ଜୋକର୍ ରହିବା ବାଧ୍ୟତାମୂଳକ। ଯଦି କାହାରି ପାଖରେ ଏଥିରୁ ଗୋଟିଏ ବି ନଥାଏ, ତେବେ ସେ ହାତ ଖେଳାଯାଇ ପାରିବ ନାହିଁ—ସ୍ୱୟଂଚାଳିତ ଭାବେ ତାସ୍ ପୁଣି ଫେଣ୍ଟି ବଣ୍ଟାଯିବ!',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୪: ଡାକ (ବିଡିଂ) ଓ ସର୍ବନିମ୍ନ ୬-ବିଡ୍ ମର୍ଯ୍ୟାଦା',
        points: [
          'ବ୍ୟକ୍ତିଗତ ବିଡ୍: ନିଜ ହାତର ତାସ୍ ଦେଖି ୦ ରୁ ୧୩ ପର୍ଯ୍ୟନ୍ତ କେତୋଟି ହାତ ଜିତିପାରିବେ ତାହାର ଡାକ ଦିଅନ୍ତୁ।',
          'ଦଳଗତ ସର୍ବନିମ୍ନ ୨ ହାତ: ଗୋଟିଏ ଦଳ ମୋଟ୍ ୦ କିମ୍ବା ୧ ହାତ ଡାକିପାରିବେ ନାହିଁ। ଯଦି ଦୁଇ ସାଥୀ ୦ ଡାକନ୍ତି, ତେବେ ଦଳର ବିଡ୍ ଆପେ ଆପେ ୨ ହୋଇଯିବ।',
          'ସର୍ବନିମ୍ନ ୬-ବିଡ୍ ରିଶଫଲ୍ ନିୟମ: ଯଦି ଦୁଇ ଦଳ ମଧ୍ୟରୁ କୌଣସି ଦଳର ବିଡ୍ ଅନ୍ତତଃ ୬ ନପହଞ୍ଚେ (ଉଭୟ ଟିମ୍ ୬ରୁ କମ୍ ଡାକନ୍ତି), ତେବେ ଖେଳ ହେବ ନାହିଁ। କୌଣସି ପେନାଲ୍ଟି ନଲାଗି ତାସ୍ ସଙ୍ଗେ ସଙ୍ଗେ ପୁଣି ଫେଣ୍ଟାଯାଇ ପରବର୍ତ୍ତୀ ଡିଲର୍ ବାଣ୍ଟିବେ।',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୫: ଜୋକର୍ ଖେଳିବା ନିୟମ',
        points: [
          'ପ୍ରଥମ ହାତରେ ଜୋକର୍ ମନା (Trick 1): ଖେଳର ପ୍ରଥମ ରାଉଣ୍ଡ୍‌ରେ ଜୋକର୍ ଫିଙ୍ଗିବା କିମ୍ବା ଜୋକର୍ ଦେଇ ଚାଲ୍ ଆରମ୍ଭ କରିବା ସମ୍ପୂର୍ଣ୍ଣ ବାରଣ।',
          'ରାଉଣ୍ଡ୍ ୨ ରୁ ୧୩ ମଧ୍ୟରେ ମୁକ୍ତ ବ୍ୟବହାର: ରାଉଣ୍ଡ୍ ୨ ରୁ ୧୩ ମଧ୍ୟରେ ଚାଲୁଥିବା ରଙ୍ଗ ହାତରେ ଥିଲେ ମଧ୍ୟ ଆପଣ ଯେକୌଣସି ସମୟରେ ଜୋକର୍ ପକାଇ ହାତ ଛଡ଼ାଇ ନେଇପାରିବେ!',
          'ଜୋକର୍ ଦେଇ ଚାଲ୍ ଆରମ୍ଭ କଲେ: ଅତି ବାଧ୍ୟ ନହେଲେ ଜୋକର୍ ଦେଇ ଚାଲ୍ ଆରମ୍ଭ କରନ୍ତୁ ନାହିଁ; କାରଣ ଏହା ଚାଲିଲେ ଏହା କେବଳ "କଳା ପାନ୍ ଦୁଇ" (2♠) ଭାବେ ଗଣାଯାଏ।',
          '୧୩ତମ ଶେଷ ରାଉଣ୍ଡ୍‌ରେ କ୍ଷମତା ହ୍ରାସ: ଶେଷ ରାଉଣ୍ଡ୍‌ରେ ଜୋକର୍ ତାର ରାଜସିକ କ୍ଷମତା ହରାଇ କେବଳ "କଳା ପାନ୍ ଦୁଇ" (2♠) ପାଲଟିଯାଏ।',
          'ରଙ୍ଗ ମାନି ଚଳିବା ବାଧ୍ୟତାମୂଳକ: ଯଦି ଆପଣଙ୍କ ପାଖରେ ଚାଲିଥିବା ରଙ୍ଗର ତାସ୍ ଅଛି, ତେବେ ସେହି ରଙ୍ଗ ହିଁ ଚଳିବାକୁ ପଡ଼ିବ (ଜୋକର୍ ପକାଇବା ବ୍ୟତୀତ)। ସେହି ରଙ୍ଗ ନଥିଲେ ତୁରୁପ୍ କାଟିପାରିବେ କିମ୍ବା ଯେକୌଣସି ତାସ୍ ଛାଡ଼ିପାରିବେ।',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୬: ରଣନୈତିକ କୌଶଳ ଓ ଏଆଇ ଚତୁରତା',
        points: [
          'ସାହେବ୍ ବଞ୍ଚାଅ ଚାଲ୍ (King-Rescue): ବିପକ୍ଷ ଖେଳାଳି ଯେତେବେଳେ ଆପଣଙ୍କ ସାହେବ୍ (K) ଉପରେ ଟିକ୍କା (A) ଛାଟେ, ସଙ୍ଗେ ସଙ୍ଗେ ଜୋକର୍ ମାରି ସେହି ଟିକ୍କାକୁ ଧୂଳି ଚଟାନ୍ତୁ ଓ ନିଜ ସାହେବ୍‌କୁ ବଞ୍ଚାନ୍ତୁ!',
          'ତୁରୁପ୍ ଟିକ୍କା ଶିକାର (Ace-Decapitation): ବିପକ୍ଷର ସବୁଠୁ ବଡ଼ ତୁରୁପ୍ ଟିକ୍କା ଉପରେ ଜୋକର୍ ପକାଇ ତାଙ୍କ ଗର୍ବ ଭାଙ୍ଗି ଦିଅନ୍ତୁ।',
          'ସାଥୀଙ୍କୁ ସମ୍ମାନ: ଯଦି ଆପଣଙ୍କ ସାଥୀ ଆଗରୁ ସେହି ହାତ ଜିତୁଛନ୍ତି, ତେବେ ବୃଥାରେ ବଡ଼ ତାସ୍ ବା ଜୋକର୍ ନଷ୍ଟ କରନ୍ତୁ ନାହିଁ।',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୭: ଖେଳର ଦ୍ରୁତଗତି ଓ "ଶୋ’ ହ୍ୟାଣ୍ଡ୍" (ହାତ ଦେଖାଇବା)',
        points: [
          'ଅବଶିଷ୍ଟ ରାଉଣ୍ଡ୍ ସ୍କିପ୍: ଯେତେବେଳେ ଦୁଇ ଦଳ ନିଜ ନିଜର ଲକ୍ଷ୍ୟ ହାସଲ କରିସାରନ୍ତି, କେବଳ ଆପଣ (ଦକ୍ଷିଣ) ବାକି ରାଉଣ୍ଡ୍ ନଖେଳି ସଙ୍ଗେ ସଙ୍ଗେ ହାତ ଶେଷ କରିପାରିବେ।',
          'ଶୋ’ ହ୍ୟାଣ୍ଡ୍ ଦାବି: ବିପକ୍ଷ ଦଳ ନିଜ ବିଡ୍ ପୂରଣ କରିସାରିବା ପରେ ଯଦି ଆପଣ ନିଶ୍ଚିତ ଥାଆନ୍ତି ଯେ ବଳକା ସବୁ ହାତ ଆପଣଙ୍କର, ତେବେ ସଠିକ୍ ତାସ୍ ବାଛି ଦାବି ଉପସ୍ଥାପନ କରନ୍ତୁ।',
          'ସିଷ୍ଟମ୍‌ର କଡ଼ା ପରୀକ୍ଷା: ଗେମ୍ ଇଞ୍ଜିନ୍ ଗାଣିତିକ ପଦ୍ଧତିରେ ପରୀକ୍ଷା କରିବ ଯେ ଆପଣଙ୍କ ବଛା ତାସ୍ ବିପକ୍ଷଙ୍କ ହାତ ଆଗରେ ୧୦୦% ଅପରାଜେୟ କି ନୁହେଁ।',
          'ଭୁଲ୍ ଦାବିରେ ଭାରୀ ଜରିମାନା: ଯଦି ଆପଣଙ୍କ ଦାବି ଭୁଲ୍ ପ୍ରମାଣିତ ହୁଏ, ତେବେ କଡ଼ା ଦଣ୍ଡ ମିଳିବ: ସମୁଦାୟ ସ୍କୋର୍ − ବର୍ତ୍ତମାନର ବିଡ୍ (ଆପଣଙ୍କ ଦଳର ମୋଟ୍ ସ୍କୋର୍‌ରୁ ପୂରା ବିଡ୍ ପଏଣ୍ଟ୍ କାଟିଦିଆଯିବ)!',
        ],
      },
      {
        title: 'ଅଧ୍ୟାୟ ୮: ପଏଣ୍ଟ୍ ଓ ସ୍କୋରିଂ ପ୍ରଣାଳୀ',
        points: [
          'ସାଧାରଣ ଡାକ (୨ ରୁ ୯): ବିଡ୍ ପୂରଣ ହେଲେ +ବିଡ୍ ପଏଣ୍ଟ୍ (ଯଥା: ୫ ବିଡ୍ କରି ୬ ହାତ ଜିତିଲେ +୫)। ଅତିରିକ୍ତ ହାତ ପାଇଁ ବୋନସ୍ ମିଳେନାହିଁ। ବିଡ୍ ଭାଙ୍ଗିଲେ -ବିଡ୍ ପଏଣ୍ଟ୍।',
          'ବଡ଼ ଡାକ (୧୦ ରୁ ୧୩): ୧୦ ବା ତା’ଠାରୁ ଅଧିକ ବିଡ୍ ସଫଳ କଲେ ଦୁଇଗୁଣା ପଏଣ୍ଟ୍ ମିଳେ (୧୦ ବିଡ୍ = +୨୦, ୧୩ ବିଡ୍ = +୨୬)!',
          '୧୩ ହାତ ବୋଷ୍ଟନ୍ ସୁଇପ୍: ସମସ୍ତ ୧୩ଟି ଯାକ ହାତ କରାୟତ୍ତ କଲେ +୨୬ ପଏଣ୍ଟ୍ ମିଳିବା ସହ ବିପକ୍ଷ ଦଳ ଉପରେ ପେନାଲ୍ଟି ଲାଗେ।',
        ],
      },
    ],
    returnButton: 'ଟେବୁଲ୍‌କୁ ଫେରନ୍ତୁ',
  },
};
