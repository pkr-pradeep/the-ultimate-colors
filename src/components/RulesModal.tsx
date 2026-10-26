import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#2A150D] via-[#1A0C08] to-[#0F0704] border-2 border-amber-600/70 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto text-amber-100 font-outfit">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-cinzel text-xs uppercase tracking-widest mb-2">
            Official Playbook
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-200 tracking-wide">
            THE UNIVERSAL JOKER
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/80 mt-1">
            Official Rulebook & Playbook · 4-Player Custom Trick-Taking Partnership Card Game
          </p>
        </div>

        {/* Dadaji Spotlight Card */}
        <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-red-950/60 to-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 aspect-[5/7] flex-shrink-0">
            <div className="w-full h-full rounded-lg bg-[#FAF6EC] border border-[#6e1423] p-0.5 shadow-md overflow-hidden">
              <img
                src="/assets/Indian_Playing_Cards/svg/53_Joker.svg"
                alt="Dadaji Universal Joker"
                className="w-full h-full object-fill rounded-md select-none pointer-events-none"
              />
            </div>
          </div>
          <div className="text-left">
            <h3 className="font-cinzel text-lg font-bold text-amber-200">
              The Dadaji Universal Joker
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
              Preserved in his imperial maroon-and-gold sherwani, white flowing beard, curled aristocratic moustache, and gold walking cane, Dadaji is the supreme authority on the table.
            </p>
            <p className="text-xs text-amber-300 font-medium mt-1">
              ★ <strong>Universal Trump:</strong> Outranks every card, sitting strictly above the Ace of Trump!
            </p>
          </div>
        </div>

        {/* Rules Sections */}
        <div className="space-y-4 text-xs sm:text-sm text-amber-100/90 text-left">
          {/* SECTION 1 */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-amber-800/40">
            <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1.5">
              SECTION 1: GAME OVERVIEW & PARAMETERS
            </h4>
            <p className="leading-relaxed mb-2">
              4 players in two fixed partnerships (partners sit directly across from each other). The game features three match boundaries:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/80">
              <li><strong>Default Point Mode (Survival):</strong> First team to reach or exceed 100 points wins the match.</li>
              <li><strong>Custom Point Mode:</strong> Custom point threshold (e.g., 60 points). First team to reach this score wins.</li>
              <li><strong>Time Mode (Blitz):</strong> Strict countdown timer (e.g., 30 minutes). Team with highest score at expiry wins (finishing ongoing hand first).</li>
            </ul>
          </div>

          {/* SECTION 2 */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-amber-800/40">
            <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1.5">
              SECTION 2: SETUP, SHUFFLING & DISTRIBUTION
            </h4>
            <p className="leading-relaxed mb-2">
              • <strong>The Deck Structure:</strong> 53 cards (standard 52 + 1 Joker). The <strong>2 of Spades is permanently removed</strong> before play and never dealt or played (52 playable cards).
            </p>
            <p className="leading-relaxed mb-2">
              • <strong>Counter-Clockwise Dealer Rotation:</strong> First dealer chosen randomly; passes strictly counter-clockwise (to player on right) each round.
            </p>
            <p className="leading-relaxed">
              • <strong>Dealing & Trump Selection:</strong> 1 card at a time counter-clockwise, first card to player directly to right of dealer. 52nd card dealt (to dealer) is turned face-up:
              <br />- <em>Standard Suit:</em> That suit becomes Trump for the round.
              <br />- <em>The Joker Twist (Equal Suits):</em> If Joker is 52nd card, hand is NOT abandoned. All suits are equal; the suit led in each trick becomes highest suit for that trick unless beaten by the Joker.
            </p>
          </div>

          {/* SECTION 3 */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-amber-800/40">
            <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1.5">
              SECTION 3: THE JOKER COMPLEX RULES
            </h4>
            <p className="leading-relaxed mb-1.5">
              • <strong>Universal Trump Status:</strong> Under standard play, outranks every card, strictly above Trump Ace.
            </p>
            <p className="leading-relaxed mb-1.5">
              • <strong>First Round Ban:</strong> Cannot be legally played during Trick 1.
            </p>
            <p className="leading-relaxed mb-1.5">
              • <strong>No Leading with Joker:</strong> Cannot start/lead a trick. If led, penalized and treated strictly as 2 of Spades for that trick.
            </p>
            <p className="leading-relaxed">
              • <strong>Last Round Devaluation:</strong> In Trick 13, supreme power is stripped; demoted to 2 of Spades. If Spades is trump, acts as low trump; if another suit is trump, acts as weak off-suit.
            </p>
          </div>

          {/* SECTION 4 */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-amber-800/40">
            <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1.5">
              SECTION 4: BIDDING & GAMEPLAY FLOW
            </h4>
            <p className="leading-relaxed mb-1.5">
              • <strong>No Nil Bids:</strong> A team is strictly prohibited from bidding 0 (Nil) or 1 trick. But an individual player can bid zero.
            </p>
            <p className="leading-relaxed mb-1.5">
              • <strong>Default 2 Tricks on 0+0:</strong> If both players of the same team bid zero, by default 2 is given as the team's default bid.
            </p>
            <p className="leading-relaxed mb-1.5">
              • <strong>Minimum Team Contract:</strong> Absolute minimum combined bid a partnership can make is 2 tricks.
            </p>
            <p className="leading-relaxed">
              • <strong>Play Mechanics:</strong> Must follow led suit if held. If void, may discard off-suit or play Trump / Joker. Highest card of led suit wins unless cut by higher trump or Joker.
            </p>
          </div>

          {/* SECTION 5 */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-amber-800/40">
            <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1.5">
              SECTION 5: THE PRECISION SCORING MATRIX
            </h4>
            <p className="leading-relaxed mb-1.5">
              • <strong>Standard Contracts (Bids 2 through 9):</strong> Meeting or exceeding bid scores exactly the bid (+bid). Overtricks award no additional points (e.g. bid 5, win 7 =&gt; +5 points).
            </p>
            <p className="leading-relaxed mb-1.5">
              • <strong>High Contracts (Bids 10 through 13):</strong> Successfully meeting 10+ bid is doubled (e.g. bid 10, win 11 =&gt; +20 points; bid 13, win 13 =&gt; +26 points).
            </p>
            <p className="leading-relaxed mb-1.5">
              • <strong>Failed Contracts (Going Set):</strong> Subtracted exactly the bid (-bid points). No double penalty (e.g. bid 5, win 4 =&gt; -5 points).
            </p>
            <p className="leading-relaxed">
              • <strong>13-Trick "Boston" Sweep:</strong> Capturing all 13 tricks automatically doubles the score for the hand (+26 for bid 13). Opposing team fails their contract and is penalized their bid (-2 minimum).
            </p>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-sm tracking-wider uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
          >
            Return to Table
          </button>
        </div>
      </div>
    </div>
  );
};
