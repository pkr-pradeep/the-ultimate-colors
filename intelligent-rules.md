# Universal Joker: Intelligent Play & Tactical Decision Engine
## Strategic Playbook, Card Memory Model & Decision Rules

---

## 1. Executive Summary

In *The Universal Joker*, card play is authoritatively strategic. Because each hand features 13 tricks, two fixed partnerships, a 52-card modified deck (2♠ removed, 1 Dadaji Joker added), and strict scoring penalties for missed bids, indiscriminate or greedy card play is fatal.

This document establishes the **Intelligent Rules Architecture** governing player decision-making, covering:
1. **Card Memory & Void Tracking** (what every player remembers about played cards and opponent voids).
2. **Dynamic Card Promotion & Boss Status** (knowing when a King, Queen, or 10 becomes the highest remaining card).
3. **Tactical Joker Deployment** (when to strike, the "King Rescue" maneuver, decapitating the Trump Ace, and avoiding the Trick 13 devaluation trap).
4. **Passing vs. Playing Discipline** (ducking, never overtaking winning partners, discarding junk cards, conserving stoppers).
5. **Contract Protection & Endgame Timing** (playing to fulfill the team contract and prevent opponent sweeps).

---

## 2. Card Memory & Table Tracking Model

Every intelligent player maintains an ongoing mental ledger of the hand across all 13 tricks:

### 2.1. The 4 Memory Registries
| Registry | Data Tracked | Tactical Purpose |
| :--- | :--- | :--- |
| **Honor Registry** | All played Aces, Kings, Queens, and Jacks by suit. | Calculates whether your card is currently the **Boss Card** (unbeatable in its suit). |
| **Trump Exhaustion** | Total trumps played, remaining trumps in circulation, and Trump Ace status. | Determines if leading or discarding trump is safe, and detects when opponents are dry. |
| **Void Matrix** | Specific suit voids declared by all 4 seats (`south`, `east`, `north`, `west`). | If West failed to follow suit on Hearts, West is **Void in Hearts**. Never lead Hearts unless you want West to trump or play Joker! If Partner is void, lead that suit to feed partner a trump trick. |
| **Dadaji Joker Status** | `isJokerPlayed: boolean`, `jokerHolderId: PlayerId \| unknown`, `playedTrickNumber: number \| null`. | Until the Joker is played, your Trump Ace is **vulnerable**. Once the Joker is spent, Trump Ace is absolute master. |

### 2.2. Card Promotion Mechanics ("The Boss Tracker")
A card is not static in rank; its power increases dynamically as higher cards are played:
- **Spades/Hearts/Diamonds/Clubs:**
  - When **Ace** is played $\rightarrow$ The **King** is promoted to **Boss (Rank 1)**.
  - When **Ace + King** are played $\rightarrow$ The **Queen** is promoted to **Boss**.
  - When **Ace + King + Queen** are played $\rightarrow$ The **Jack** is promoted to **Boss**.
  - When all higher cards in a suit are exhausted $\rightarrow$ Even a **7 or 8** becomes an unassailable Boss winner.

**Rule of Conservation:** An intelligent player *never* plays a promoted Boss card on a trick their partner is already winning, and *never* throws away a 2nd-tier card (e.g. King) while the superior card (Ace) is still lurking in an opponent's hand.

---

## 3. Tactical Joker Deployment (When to Strike vs. When to Hold)

The Dadaji Universal Joker is the supreme trump in tricks 2–12 (beats everything, including the Trump Ace). However, **there is only one Joker in the entire game**, and in Trick 13 it is demoted to a weak 2 of Spades.

### Rule 3.1: The "King-Rescue" Strike (Trapped Honor Defense)
* **Context:** Opponent leads or plays an **Ace** of a suit where you hold the **King** (and optionally other low cards of that suit).
* **Problem:** Under standard follow-suit rules, if you follow with your King, your King is slaughtered by the Ace for zero gain.
* **The Intelligent Move:** Because the playbook allows hitting the Joker even when holding cards of the led suit (Tricks 2–13), you **strike with the Dadaji Joker!**
  - **Outcome 1:** You win the trick immediately with the Joker.
  - **Outcome 2:** The opponent's Ace is killed.
  - **Outcome 3:** Your King is preserved in your hand and **immediately promoted to the Boss Card** of that suit for a guaranteed future trick!

### Rule 3.2: Decapitating the Opponent's Trump Ace
* **Context:** An opponent plays or ruffs with the **Trump Ace** (the highest standard card in the match).
* **The Intelligent Move:** If taking this trick shifts momentum or secures your partnership bid, **hit the Dadaji Joker**.
  - The Trump Ace is the highest threat on the table. Crushing it with the Joker yields the highest point-leverage possible in trick-taking.

### Rule 3.3: Partner Protection (Absolute Prohibition)
* **Rule:** **NEVER hit the Joker if your partner is already winning the trick** (e.g., Partner played Trump King or side Ace and no opponent has beaten it).
* **Exception:** Zero exceptions. Burning the supreme Joker on partner's winning trick is a critical blunder.

### Rule 3.4: Low-Stake Abstinence
* **Rule:** Do not blow the Joker on low-value cards (e.g., Opponent leads 5♦ and the current highest is 9♦), **UNLESS**:
  1. Trick 12 has arrived (the Joker *must* be cashed before Trick 13 devaluation).
  2. Losing this specific trick directly causes your partnership contract to fail.
  3. You are void in the led suit and hold literally no other playable card.

### Rule 3.5: The Trick 12 "Last Hurrah" Mandate
* **Rule:** If you still hold the Dadaji Joker entering **Trick 12**, you **MUST play it in Trick 12** if you can legally do so, because entering Trick 13 converts the Joker into the 2 of Spades.

---

## 4. Passing vs. Playing Discipline

"Passing" in trick-taking refers to **ducking** (playing a low card to let a trick go) or **sloughing/discarding** when you cannot or should not win.

### 4.1. The Partner-In-Command Rule
* If **Partner** currently holds the winning card of the trick:
  - If you hold cards of the led suit: Play your **lowest legal card** of that suit.
  - If you are void in the led suit: Do **not** trump or Joker! Slough your lowest, most useless off-suit junk card to cleanly pass the trick to your partner.

### 4.2. Conserving Second-Best Honors ("The Ducking Principle")
* **Scenario:** Opponent leads 10♠. You hold $K♠$ and $4♠$. The $A♠$ has not been played yet and sits behind you (in the fourth seat).
* **Analysis:** If you play the $K♠$, the fourth seat will drop the $A♠$ and take your King.
* **Intelligent Move:** **Duck / Pass** with the $4♠$. Force the opponent to either play their Ace now or let the trick go to their partner cheaply. Save your King for when the Ace has fallen!

### 4.3. Sacrificial Trumping (When to Over-Trump)
* If an opponent trumps with a low trump (e.g. 4♥):
  - If you hold a higher trump (e.g. 9♥ or J♥): **Over-trump** to deny the opponent the cheap trick.
  - If you only hold the Trump Ace or Trump King, and the trick has no high cards: evaluate whether using your Boss Trump is worth 1 trick, or if sloughing an off-suit loser to maintain trump control is superior.

---

## 5. Leading Strategy & Table Control

The player who leads sets the battleground for the trick. Leading randomly is the most common novice failure.

### 5.1. Leading Cashable Boss Cards (Cashing Winners)
* If you hold the **Boss Card** of a suit (e.g. $A♣$ when Clubs is not trump, or $K♣$ after $A♣$ fell):
  - **Lead it early** (Tricks 2–6) before opponents develop voids and can trump your winners.
  - Collect the tricks your partnership counted during bidding.

### 5.2. Leading to Feed Partner's Void
* If the Memory Engine knows **Partner is Void in Diamonds**, and you hold a low Diamond:
  - **Lead the low Diamond!**
  - Partner can cheaply trump with a low trump or slough a liability, converting your losing card into a partnership asset.

### 5.3. Leading Through Opponent Strength
* If an opponent to your right holds known high cards, lead through them to let your partner (sitting behind them) trap their honors.

### 5.4. Never Lead Dadaji Joker Unless Hand Has No Choice
* Per the playbook rules, leading the Joker devalues it to the **2 of Spades** for that trick.
* Therefore, **never lead the Joker** unless it is your last remaining card. Always preserve the Joker to strike as a responder!

---

## 6. Contract Awareness & Endgame Score Protection

Card play must constantly adapt to the scoreboard:

| Situation | Strategic Imperative | Card Behavior |
| :--- | :--- | :--- |
| **Contract in Jeopardy** (Need 2 more tricks, 3 tricks left) | High Aggression | Cash Boss cards immediately; fire Joker on the first dangerous opponent card. |
| **Contract Secured** (Already met bid) | Controlled Defense | Protect partner's hand; avoid taking tricks from partner; try to prevent opponents from making their bid. |
| **Opponent on Brink of Boston (13 tricks)** | Emergency Veto | Fire the Joker or highest Trump indiscriminately to break the 13-trick sweep and prevent double penalty. |
| **Trick 12 with Joker** | Mandatory Cash | Play Dadaji Joker immediately; do not carry into Trick 13. |

---

## 7. Implementation Architecture (Heuristic Algorithm)

When an AI player (or auto-play recommendation system) selects a card from `legalCards`, it executes the following decision hierarchy:

```
Step 1: Check Current Trick State
├── Trick is Empty (AI is Leading)?
│   ├── Do NOT lead Joker (counts as 2♠) unless only Joker remains.
│   ├── Check for Cashable Boss Aces / Promoted Kings in side suits.
│   │   └── If found, lead Boss Card to secure trick before opponents void.
│   ├── Check if Partner has a known Void in a suit where AI has low cards.
│   │   └── If found, lead low card of that suit for Partner to trump.
│   └── Otherwise, lead lowest card from longest un-trumped suit.
│
└── Trick is in Progress (AI is Responding):
    ├── Is Partner currently winning the trick?
    │   ├── YES (Partner is winning):
    │   │   ├── Do NOT play Joker!
    │   │   ├── Do NOT play higher trumps/honors over Partner!
    │   │   └── Play lowest legal card (or discard worst off-suit junk).
    │   └── NO (Opponents are winning):
    │       ├── Can AI play Dadaji Joker (Trick >= 2)?
    │       │   ├── Did opponent play an Ace, Trump Ace, or Boss card?
    │       │   │   └── YES: Strike with DADAJI JOKER! (King-Rescue / Ace Decapitation).
    │       │   ├── Does AI hold a King trapped by opponent's Ace?
    │       │   │   └── YES: Strike with DADAJI JOKER to save the King!
    │       │   ├── Is it Trick 12?
    │       │   │   └── YES: Play Joker now before it degrades to 2♠ in Trick 13.
    │       │   └── Otherwise: Save Joker unless trick guarantees contract.
    │       ├── Can AI win with standard card of led suit?
    │       │   └── Play lowest winning card of led suit (conserve higher honors).
    │       ├── Can AI trump (when void in led suit)?
    │       │   └── Play lowest winning trump above opponent's card.
    │       └── Cannot win:
    │           └── Duck/pass by discarding lowest card in non-trump suit.
```

---

## 8. Summary Checklist for Players & Engineers

- [x] **Memory Active:** Track all 4 Aces, the Trump Ace, and who showed void in what suit.
- [x] **King Rescue:** When an opponent drops an Ace over your King, fire the Joker to kill their Ace and promote your King.
- [x] **Ace Decapitation:** Crush the opponent's Trump Ace with the Joker at the highest leverage moment.
- [x] **Never Kill Partner's Trick:** If Partner's card is currently highest, discard low; keep your strength for future rounds.
- [x] **Trick 13 Avoidance:** Never hold the Joker until Trick 13 where it becomes 2♠; cash it in Trick 12 at the latest.
- [x] **Lead With Bosses, Not Jokers:** Cash established high cards; never start a trick with Joker unless forced.
