#!/usr/bin/env bash
# Copy segment masters into per-SKU label slots (same scheme; supplier swaps weight/flavour text in print)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/supplier-pack/02-product-labels"
SITE="$ROOT/images/labels"
SUP="$SRC/labels"
mkdir -p "$SITE" "$SUP"

cp_label() { local id="$1" from="$2"; cp -f "$SRC/$from" "$SUP/${id}.png"; cp -f "$SUP/${id}.png" "$SITE/${id}.png"; }

MASTER="_MASTER-adult-dog-chicken-sweet-potato.png"
cp_label "dog-adult-dry-chicken-2" "$MASTER"
cp_label "dog-adult-dry-chicken-6" "$MASTER"

cp_label "dog-puppy-dry-salmon" "packaging-dog-puppy-dry-master.png"
cp_label "dog-puppy-dry-chicken" "packaging-dog-puppy-dry-master.png"
cp_label "dog-puppy-wet-pate" "packaging-dog-puppy-dry-master.png"
cp_label "dog-puppy-wet-beef" "packaging-dog-puppy-dry-master.png"

cp_label "dog-senior-dry-joint" "packaging-dog-senior-dry-master.png"
cp_label "dog-senior-dry-light" "packaging-dog-senior-dry-master.png"
cp_label "dog-senior-wet-turkey" "packaging-dog-senior-dry-master.png"
cp_label "dog-senior-wet-fish" "packaging-dog-senior-dry-master.png"

cp_label "dog-comp-dry-bulk" "packaging-dog-competition-dry-master.png"
cp_label "dog-comp-dry-power" "packaging-dog-competition-dry-master.png"
cp_label "dog-comp-wet-recovery" "packaging-dog-competition-dry-master.png"
cp_label "dog-comp-wet-mass" "packaging-dog-competition-dry-master.png"
cp_label "dog-comp-supp-gainer" "packaging-dog-competition-dry-master.png"
cp_label "dog-comp-supp-protein" "packaging-dog-competition-dry-master.png"

for id in dog-adult-dry-lamb dog-adult-dry-beef dog-adult-dry-duck dog-adult-dry-large dog-adult-dry-small \
  dog-adult-wet-salmon dog-adult-wet-turkey dog-adult-wet-beef dog-adult-wet-lamb; do
  cp_label "$id" "$MASTER"
done

cp_label "cat-kitten-dry-turkey" "packaging-cat-kitten-dry-master.png"
cp_label "cat-kitten-dry-chicken" "packaging-cat-kitten-dry-master.png"
cp_label "cat-kitten-wet-pate" "packaging-cat-kitten-dry-master.png"
cp_label "cat-kitten-wet-chicken" "packaging-cat-kitten-dry-master.png"

cp_label "cat-adult-dry-fish" "packaging-cat-adult-dry-master.png"
for id in cat-adult-dry-indoor cat-adult-dry-salmon cat-adult-dry-urinary \
  cat-adult-wet-tuna cat-adult-wet-chicken cat-adult-wet-duck cat-adult-wet-multipack; do
  cp_label "$id" "packaging-cat-adult-dry-master.png"
done

cp_label "cat-senior-dry-care" "packaging-cat-senior-dry-master.png"
cp_label "cat-senior-wet-salmon" "packaging-cat-senior-dry-master.png"
cp_label "cat-senior-wet-pate" "packaging-cat-senior-dry-master.png"

TREATS="packaging-treats-snacks.png"
for id in dog-snack-training dog-snack-jerky dog-snack-dental dog-snack-puppy-biscuit dog-snack-lick dog-snack-salmon \
  cat-snack-tuna cat-snack-dental cat-snack-salmon cat-snack-lick cat-snack-bonito cat-snack-kitten; do
  cp_label "$id" "$TREATS"
done

for id in dog-chew-rubber dog-chew-rope dog-chew-antler dog-chew-bully dog-chew-dental-bone dog-chew-kong \
  cat-toy-wand cat-toy-mice cat-toy-scratch cat-toy-tunnel cat-toy-ball-track cat-toy-puzzle; do
  cp_label "$id" "$TREATS"
done

echo "Synced $(ls -1 "$SITE" | wc -l | tr -d ' ') labels to $SITE"
