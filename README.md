# The Ultimate Colors
## Official Rulebook & Playbook
*A 4-Player Custom Trick-Taking Partnership Card Game*

---

### SECTION 1: GAME OVERVIEW & PARAMETERS
"The Ultimate Colors" is a highly tactical, low-scoring variant of traditional Spades played by 4 players in two fixed partnerships (partners sit directly across from each other). The game introduces a dynamically shifting trump suit determined by the deal, a high-stakes standalone Joker, and a punishing, precise scoring matrix.

#### 1.1 Match Boundaries & Winning Conditions
Before the first shuffle, players must agree on how the overall match will end. The game offers three options:
1. **Default Point Mode (Survival):** The first team to reach or exceed **100 points** wins the match.
2. **Custom Point Mode:** Players specify a custom point threshold (e.g., **60 points**). The first team to reach this score wins.
3. **Time Mode (Blitz):** Players set a strict countdown timer (e.g., **30 minutes**). Play continues across multiple hands until the timer expires. The team with the **highest total score** at the end of the time limit wins.

---

### SECTION 2: SETUP, SHUFFLING & DISTRIBUTION
#### 2.1 The Deck Structure
* The game uses exactly **53 cards**: a standard 52-card deck plus **1 Joker**.
* **The Permanent Discard:** Before any shuffling or dealing begins, the **2 of Spades** is permanently removed from the deck and set aside for the duration of the match. It is never played.

#### 2.2 Counter-Clockwise Dealer Rotation
* **First Round:** The initial dealer is chosen randomly.
* **Subsequent Rounds:** The role of the dealer passes strictly counter-clockwise. The player sitting to the **right** of the current dealer becomes the new dealer for the next hand.

#### 2.3 The Dealing & Trump Selection Process
1. The dealer thoroughly shuffles the 53-card deck.
2. The dealer distributes the cards one by one in a counter-clockwise direction. The very first card goes to the player sitting **directly to the right of the dealer**.
3. Dealing continues sequentially until 52 cards have been dealt (each player receives exactly 13 cards).
4. **The Last Card Reveal:** The 52nd card dealt (which goes to the dealer) is turned face-up for all players to see. The symbol of this card establishes the trump conditions for that entire round:
   * **Standard Suit Trigger:** If the card is a Spade, Diamond, Heart, or Club, that suit becomes the **Highest Suit (Trump Suit)** for the duration of the hand. (e.g., if the 4 of Spades is revealed, Spades are trump; if the Ace of Diamonds is revealed, Diamonds are trump).
   * **The Joker Twist (Equal Suits):** If the **Joker** is the last card dealt to the dealer, the hand is **not** abandoned or reshuffled. Instead, it triggers a special rule: **All suits are equal**. No single suit acts as a permanent trump. Whichever suit is led at the beginning of a trick becomes the highest suit for that specific trick, unless it is beaten by the Joker.

---

### SECTION 3: THE JOKER COMPLEX RULES
The Joker is a high-risk, high-reward standalone asset that operates under severe tactical limitations:

#### 3.1 Universal Trump Status
Under standard gameplay conditions, the Joker outranks every card in the deck, sitting strictly above the Ace of whatever suit was designated the Highest Suit.

#### 3.2 Strict Play Constraints
* **First Round Ban:** The Joker **cannot** be legally played by any player during the very first trick of the hand.
* **No Leading with the Joker:** A player cannot start/lead a trick by playing the Joker. If a player breaks this restriction and leads a trick with the Joker, it is instantly penalized and treated strictly as a **2 of Spades** for that trick.
* **Last Round Devaluation:** If a player holds onto the Joker until the final round (the 13th trick) and plays it there, its absolute supreme power is stripped. It is demoted to a **2 of Spades**.
  * *The Trump Catch:* If **Spades** happens to be the chosen Highest Suit for that game, the Joker still functions as a low trump card (since it is the 2 of Spades). If any other suit is the Highest Suit, the devalued Joker acts as a standard, weak off-suit 2 of Spades.

---

### SECTION 4: BIDDING & GAMEPLAY FLOW
#### 4.1 Minimum Bidding & Bidding Restrictions
* Bidding proceeds counter-clockwise, beginning with the player to the right of the dealer.
* **No Nil Team Bids:** A partnership is strictly prohibited from bidding 0 (Nil) or 1 trick combined. An individual player can bid 0 as long as their partner bids at least 2. If both players on a team bid below 2 combined, the team bid must be revised to meet the 2-trick minimum.
* **Minimum Team Contract:** The absolute minimum combined bid a partnership can make is **2 tricks**.
* **6-Bid Reshuffle Rule:** If the combined summation of both teams' bids is less than 6 (`Team 1 Bid + Team 2 Bid < 6`), play does not proceed and the cards are reshuffled and dealt by the next dealer counter-clockwise.

#### 4.2 Play Mechanics
* Players must follow the suit that was led if they possess it.
* If a player is void in the led suit, they may discard an off-suit card or play a card from the Highest Suit (or the Joker) to attempt to seize the trick.
* The highest card of the led suit wins the trick, unless cut by a higher card of the designated trump suit or the Joker. The winner of a trick leads the next round.

---

### SECTION 5: THE PRECISION SCORING MATRIX
Points are awarded on a raw point-for-trick basis. The traditional multiplication of scores by 10 is completely eliminated.

#### 5.1 Successful Contracts (Making the Bid)
* **Standard Contracts (Bids 2 through 9):** If a team meets or exceeds their combined partnership bid, they score **exactly the number of points they bid**. Extra tricks won (overtricks) grant no additional points. (e.g., bidding 5 and winning 7 tricks rewards exactly **+5 points**).
* **High Contracts (Bids 10 through 13):** If a team successfully bids 10 or more tricks and meets their goal, their reward is **doubled**. (e.g., bidding 10 and winning 11 rewards exactly **+20 points**).

#### 5.2 Failed Contracts (Going Set)
* If a team fails to meet their combined partnership bid, they do not suffer a double penalty. The exact number of points they bid is **subtracted** from their overall score. (e.g., bidding 5 and winning 4 results in **-5 points**; bidding 10 and winning 9 results in **-10 points**).

#### 5.3 The 13-Trick "Boston" Sweep
* If a team manages to successfully capture **all 13 tricks** in a single hand, their score is **automatically doubled**, regardless of what they originally bid.
* **The Math Breakdown:** If a team bids 13 and captures all 13 tricks, they get the High Contract double (26 points) which becomes the baseline, resulting in **+26 points**.
* **The Opponent Deficit:** If one team takes all 13 tricks, the opposing team automatically takes 0 tricks. Because the opposing team's minimum required bid was 2, they failed their contract and are penalized exactly their bid (e.g., **-2 points**).

---

### SECTION 6: ANDROID APK BUILD (CAPACITOR)

This React + Vite web application can be packaged into an Android APK using Capacitor (`capacitor.config.ts` is already configured with `webDir: 'dist'`).

1. **Install Capacitor & Initialize Android (one-time setup):**
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli
   npx cap add android
   ```

2. **Build & Sync Web Assets to Android:**
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Generate APK:**
   - Open in Android Studio via `npx cap open android` and select **Build > Build Bundle(s) / APK(s) > Build APK(s)**, or build via Gradle:
   ```bash
   cd android && ./gradlew app:assembleDebug
   ```
   The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.