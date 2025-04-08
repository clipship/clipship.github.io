The original sample video `sample_960x400_ocean_with_audio.mp4` was downloaded from [filesamples.com](https://filesamples.com/formats/mp4).
It was then compressed and modified to contain _2 mono audio streams_, instead of a single stereo audio stream:

```sh
ffmpeg -i ./sample_960x400_ocean_with_audio.mp4 -filter_complex "channelsplit" -ac 1 -c:v libx265 -crf 35 sample-multistream.mp4
```
