Yes. I checked the **actual DOCX you uploaded**, not just the screenshots. Overall, it is **quite strong as a student project paper**, but I would **not submit this exact version to IEEE yet**.

### My assessment

| Area                        | Assessment                                                        |
| --------------------------- | ----------------------------------------------------------------- |
| Overall technical structure | 🟢 Good                                                           |
| Abstract                    | 🟢 Good                                                           |
| Introduction                | 🟢 Good                                                           |
| Literature survey           | 🟢 Good foundation                                                |
| Architecture                | 🟢 Strong                                                         |
| Methodology                 | 🟢 Strong                                                         |
| Technical stack             | 🟢 Strong                                                         |
| Results/discussion          | 🟡 **Needs verification**                                         |
| References                  | 🟡 **Need correction/expansion**                                  |
| AI-detection risk           | 🟢 Your external results are reasonable                           |
| Plagiarism risk             | 🟡 Cannot determine exact % without a similarity database/checker |
| IEEE readiness              | 🟡 **Needs another revision**                                     |

Your paper has a clear progression from tokenization → fractionalization → AMM/order book → implementation → testing → results. That's a good structure. 

## The biggest issue I found

### Your Results section contains claims that need actual experimental evidence.

For example, the paper currently says:

> "~99% accuracy"

and

> "average 2–3 seconds"

and

> "hundreds of concurrent users"

and

> "Transaction success rates remained above 97%"

These are substantial experimental claims. 

**If you actually measured these values, keep them and show how you measured them.**

If these numbers were estimated/generated rather than obtained from your tests, **we should remove or replace them**.

This is more important than getting an AI detector from 3% to 0%.

---

# I also checked your references

This part is actually better than I expected.

Your IMF reference is legitimate. The IMF publication is **"Tokenization and Financial Market Inefficiencies"**, published in January 2025, and the authors include Itai Agur, Germán Villegas-Bauer, Tommaso Mancini-Griffoli, Maria Soledad Martinez Peria, and Brandon Tan. ([IMF][1])

Your WEF reference is also legitimate. The **World Economic Forum published "Asset Tokenization in Financial Markets: The Next Generation of Value Exchange" on May 21, 2025**. ([World Economic Forum][2])

Your CFA Institute reference is also real. **Urav Soni, Olivier Fines and Jinming Sun** authored *An Investment Perspective on Tokenization — Part I* in January 2025. ([CFA Institute Research and Policy Center][3])

And the IFSCA document is real: it is a **February 26, 2025 consultation paper on the regulatory approach toward tokenization of real-world assets**. ([IFSC Authority][4])

### But your bibliography needs to be made more IEEE-like.

For example, currently you have:

> [3] World Economic Forum, "Asset Tokenization in Financial Markets," 2025.

That's not enough for a serious IEEE submission.

We should add things such as:

* complete title
* organization/authors
* publication/report details
* DOI where applicable
* URL where appropriate
* access date where appropriate

And the IMF reference in particular should include the complete author list rather than just "Agur, I. et al.".

---

# Another thing I noticed

Your paper says the system uses:

> **Ethereum test network**

and later says contracts are deployed to an Ethereum test network.  

But from the project we've been building, you have also been using a **local/simulated environment** during development.

That's fine, but the paper needs to be **exact about what was actually implemented**.

For example, we should distinguish:

**Development/testing:**

* Ganache/local blockchain
* Hardhat
* Solidity
* MetaMask

**Final prototype deployment:**

* whichever Ethereum testnet you actually used

If you haven't actually deployed to an Ethereum testnet yet, **don't claim that you did**.

---

# Your literature survey is good, but can be much stronger

Your current survey correctly identifies a gap:

> existing work focuses heavily on legal frameworks, market analysis and policy rather than practical implementations. 

That's a reasonable research gap.

However, for an IEEE paper, I'd expand this to around **8–12 strong references**, rather than only five.

We can include:

* IMF
* World Economic Forum
* CFA Institute
* IFSCA
* peer-reviewed blockchain/tokenization research
* relevant Ethereum/smart-contract research
* AMM/decentralized exchange research

That will make your literature review look much more like an actual research paper rather than a project report.

---

# One technical inconsistency to fix

Your paper says:

> "The proposed system follows a four-layer architecture..."

Then later the Technical Stack section says:

> "the work is divided across five different layers"

Those aren't necessarily contradictory because the sections may be describing different abstractions, but **an IEEE reviewer could question this**.

We should standardize it.

I'd recommend:

### Five-layer architecture

1. **Presentation Layer** — React.js
2. **Application/Logic Layer** — Node.js + Express.js
3. **Persistence Layer** — MongoDB
4. **Blockchain & Smart Contract Layer** — Solidity + Ethereum
5. **Wallet & Development/Testing Layer** — MetaMask + Hardhat/Ganache

Or, if your architecture diagram currently has four layers, keep the architecture at four layers and treat testing tools separately.

---

# Your AMM + Order Book addition is actually a strong point

This is one of the more interesting aspects of your paper.

You aren't only saying:

> "Property → ERC-20 tokens → buy."

You've described:

**Asset → fractional ERC-20 tokens → AMM liquidity → order-book marketplace → ownership transfer**

The AMM section explains the liquidity pool and constant-product mechanism, while the order-book section explains price-controlled trading. 

That gives your project a stronger technical contribution.

But there's an important requirement:

**You need to demonstrate that these contracts actually work.**

For example:

* Token minting test
* Token transfer test
* AMM buy/sell test
* Liquidity addition/removal
* Price calculation
* Order creation
* Order matching
* Failed transaction handling
* Ownership update

Then your Results section can report actual measurements.

---

# AI detector result

Based on your screenshots:

**MyDetector:**

* 3% AI
* 30% mixed
* 67% human

That's excellent.

The other detector gave **30% AI/GPT**, but even that detector classified it as:

> "Most Likely Human written, may include parts generated by AI/GPT."

I wouldn't rewrite the entire paper just to chase an AI score.

Your actual document also contains project-specific implementation details—React, Node.js, MongoDB, Solidity, PropertyToken.sol, BondingCurveAMM.sol, OrderBookMarketplace.sol, MetaMask, etc.—rather than being purely generic blockchain prose. 

---

# My verdict

### Current paper: **7.5–8/10**

### After fixing the issues above: **8.5–9/10 for a student IEEE conference submission**

The paper **does not look like a bad project report**. It already has the basic structure of a technical paper.

But before submission, I would make these **5 changes**:

1. **Verify every numerical result** — especially 99%, 2–3 seconds, 97%, hundreds of users.
2. **Expand and properly format the references.**
3. **Add more literature sources.**
4. **Make the architecture terminology consistent.**
5. **Add actual experimental methodology/results for AMM and order-book functionality.**

And most importantly, **don't fabricate experimental results just to make the paper look stronger**. IEEE's ethics requirements emphasize accurate reporting of research data; unsupported numbers are a much bigger problem than an AI detector showing 20–30%.

Your current paper explicitly describes itself as a prototype and acknowledges limitations, which is actually a good direction for an honest submission. 

**If you want, the next thing we should do is go through this exact DOCX section-by-section and I can mark `KEEP / CHANGE / REMOVE / ADD` for every paragraph before you submit it.**

[1]: https://www.imf.org/en/publications/fintech-notes/issues/2025/01/29/tokenization-and-financial-market-inefficiencies-561256?utm_source=chatgpt.com "Tokenization and Financial Market Inefficiencies"
[2]: https://www.weforum.org/reports/asset-tokenization-in-financial-markets-the-next-generation-of-value-exchange?utm_source=chatgpt.com "Asset Tokenization in Financial Markets | World Economic Forum"
[3]: https://rpc.cfainstitute.org/research/reports/2025/investment-perspective-tokenization?utm_source=chatgpt.com "An Investment Perspective on Tokenization Part I"
[4]: https://ifsca.gov.in/web/viewer.html?file=%2FDocument%2FReportandPublication%2Fifsca-consultation-paper-on-regulatory-approach-towards-tokenization-of-real-world-assets03032025111644.pdf&utm_source=chatgpt.com "IFSCA Consultation Paper on Regulatory Approach towards Tokenization of Real-World Assets - ifsca-consultation-paper-on-regulatory-approach-towards-tokenization-of-real-world-assets03032025111644.pdf"
