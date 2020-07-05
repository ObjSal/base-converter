# Base encoder and decoder

Not a typical char by char conversion.<br>

Uses a modified base64 algorithm to encode ascii to and from various numerical bases.<br>

Encode/decode using:
* Base 2
* Base 8
* Base 10
* Base 16
* Base 58
* Base 64

Base58 encoding output/input is not compatible with base58check.

Algorithm can easily be adapted for binary input/output.