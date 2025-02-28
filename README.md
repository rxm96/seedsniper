# CSFloat Skin Search Tool

A simple tool for searching CS2 skin listings on CSFloat.

## Usage

The tool is run via command line (CMD) with various parameters:

`csfloat.exe --def_index VALUE --paint_index VALUE [--max_float VALUE] [--seeds VALUES] --api-key YOUR_API_KEY`

### Required Parameters:

- `--def_index`: Definition index of the item (determines weapon type)
- `--paint_index`: Paint index (determines skin type)
- `--api-key`: Your CSFloat API key

### Optional Parameters:

- `--max_float`: Maximum float value (e.g., 0.08 for Factory New/Minimal Wear)
- `--seeds`: Paint seeds for local filtering (can be comma-separated or space-separated)

## Examples

### Search for a Karambit Gamma Doppler with maximum float of 0.03:
`csfloat.exe --def_index 507 --paint_index 569 --max_float 0.03 --api-key DEIN_API_KEY`

### Search for an M9 Bayonet with specific paint seeds:

`csfloat.exe --def_index 508 --paint_index 569 --seeds 123,456,789 --api-key DEIN_API_KEY`

### Alternative specification of paint seeds:
`csfloat.exe --def_index 508 --paint_index 569 --seeds 123 456 789 --api-key DEIN_API_KEY`

## API-Key

The tool requires a valid CSFloat API key. You can obtain this from the [CSFloat Developer page](https://csfloat.com/developers).


