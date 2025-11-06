# Avatar Placeholder Asset Specifications

This document describes the placeholder assets needed for the avatar collection unlock system.

## Directory Structure

```
assets/
├── avatar/
│   ├── heads/
│   │   ├── head_warrior_helmet_placeholder.png
│   │   ├── head_mage_hat_placeholder.png
│   │   ├── head_rogue_hood_placeholder.png
│   │   └── head_crown_placeholder.png
│   ├── torsos/
│   │   ├── torso_warrior_armor_placeholder.png
│   │   ├── torso_mage_robe_placeholder.png
│   │   ├── torso_ranger_cloak_placeholder.png
│   │   └── torso_royal_garment_placeholder.png
│   └── legs/
│       ├── legs_warrior_boots_placeholder.png
│       ├── legs_mage_sandals_placeholder.png
│       ├── legs_ranger_leggings_placeholder.png
│       └── legs_noble_pants_placeholder.png
├── head.png (default - already exists)
├── torso.png (default - already exists)
└── legs.png (default - already exists)
```

## Naming Convention

All placeholder images follow the pattern: `{partType}_{partId}_placeholder.png`

Where:

- `partType` is one of: `head`, `torso`, `legs`
- `partId` is the avatar part ID (e.g., `warrior_helmet`, `mage_hat`)

Examples:

- `head_warrior_helmet_placeholder.png`
- `torso_warrior_armor_placeholder.png`
- `legs_warrior_boots_placeholder.png`

## Asset Specifications

### Image Requirements

1. **Format**: PNG with transparency support
2. **Dimensions**:
   - Recommended: 256x256 pixels (square aspect ratio)
   - Minimum: 128x128 pixels
   - Maximum: 512x512 pixels
3. **Style**: Should match the style of existing default assets (`head.png`, `torso.png`, `legs.png`)
4. **Transparency**: Use transparent backgrounds
5. **Color Depth**: 32-bit RGBA

### Part-Specific Requirements

#### Head Parts

- **Default**: `assets/head.png`
- **Warrior Helmet**: Should represent a medieval warrior helmet
- **Mage Hat**: Should represent a wizard/conical hat
- **Rogue Hood**: Should represent a hood/shadowy appearance
- **Crown**: Should represent a royal crown

#### Torso Parts

- **Default**: `assets/torso.png`
- **Warrior Armor**: Should represent plate armor or chainmail
- **Mage Robe**: Should represent flowing robes with mystical elements
- **Ranger Cloak**: Should represent a hooded cloak or leather armor
- **Royal Garment**: Should represent elegant regal clothing

#### Leg Parts

- **Default**: `assets/legs.png`
- **Warrior Boots**: Should represent heavy combat boots
- **Mage Sandals**: Should represent simple footwear or sandals
- **Ranger Leggings**: Should represent practical leggings or pants
- **Noble Pants**: Should represent elegant pants or trousers

## Mapping to Part IDs

The following table maps avatar part IDs to their corresponding placeholder images:

| Part ID                | File Path                                                  | Description                    |
| ---------------------- | ---------------------------------------------------------- | ------------------------------ |
| `default_head`         | `assets/head.png`                                          | Default head (already exists)  |
| `head_warrior_helmet`  | `assets/avatar/heads/head_warrior_helmet_placeholder.png`  | Warrior helmet                 |
| `head_mage_hat`        | `assets/avatar/heads/head_mage_hat_placeholder.png`        | Mage hat                       |
| `head_rogue_hood`      | `assets/avatar/heads/head_rogue_hood_placeholder.png`      | Rogue hood                     |
| `head_crown`           | `assets/avatar/heads/head_crown_placeholder.png`           | Crown                          |
| `default_torso`        | `assets/torso.png`                                         | Default torso (already exists) |
| `torso_warrior_armor`  | `assets/avatar/torsos/torso_warrior_armor_placeholder.png` | Warrior armor                  |
| `torso_mage_robe`      | `assets/avatar/torsos/torso_mage_robe_placeholder.png`     | Mage robe                      |
| `torso_ranger_cloak`   | `assets/avatar/torsos/torso_ranger_cloak_placeholder.png`  | Ranger cloak                   |
| `torso_royal_garment`  | `assets/avatar/torsos/torso_royal_garment_placeholder.png` | Royal garment                  |
| `default_legs`         | `assets/legs.png`                                          | Default legs (already exists)  |
| `legs_warrior_boots`   | `assets/avatar/legs/legs_warrior_boots_placeholder.png`    | Warrior boots                  |
| `legs_mage_sandals`    | `assets/avatar/legs/legs_mage_sandals_placeholder.png`     | Mage sandals                   |
| `legs_ranger_leggings` | `assets/avatar/legs/legs_ranger_leggings_placeholder.png`  | Ranger leggings                |
| `legs_noble_pants`     | `assets/avatar/legs/legs_noble_pants_placeholder.png`      | Noble pants                    |

## Usage

Once placeholder images are created, update `src/lib/avatar-assets.ts` to uncomment the placeholder image requires and remove the temporary default image assignments.

The asset mapping is handled automatically by `getAvatarImageSource()` function in `src/lib/avatar-assets.ts`.

## Future Art Replacement

When final artwork is ready, replace the placeholder images with the final assets. The naming convention should remain the same, but remove the `_placeholder` suffix:

- `head_warrior_helmet_placeholder.png` → `head_warrior_helmet.png`
- `torso_warrior_armor_placeholder.png` → `torso_warrior_armor.png`
- etc.

Then update `src/lib/avatar-assets.ts` to use the new filenames.
