<div align="center">
<h1>Nougat: Neural Optical Understanding for Academic Documents</h1>

[![Paper](https://img.shields.io/badge/Paper-arxiv.2308.13418-white)](https://arxiv.org/abs/2308.13418)
[![GitHub](https://img.shields.io/github/license/facebookresearch/nougat)](https://github.com/facebookresearch/nougat)
[![PyPI](https://img.shields.io/pypi/v/nougat-ocr?logo=pypi)](https://pypi.org/project/nougat-ocr)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/release/python-390/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Hugging Face Spaces](https://img.shields.io/badge/🤗%20Hugging%20Face-Community%20Space-blue)](https://huggingface.co/spaces/ysharma/nougat)

</div>

This is the official repository for Nougat, the academic document PDF parser that understands LaTeX math and tables.

Project page: https://facebookresearch.github.io/nougat/

### Get prediction for a PDF
#### API

Install Dependencies

```sh
$ pip install .
```

Run the app

```sh
$ python app.py
```

To get a prediction of a PDF file by making a POST request to http://127.0.0.1:8503/predict/. It also accepts parameters `start` and `stop` to limit the computation to select page numbers (boundaries are included).

The response is a string with the markdown text of the document.

```sh
curl -X 'POST' \
  'http://127.0.0.1:8503/predict/' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@<PDFFILE.pdf>;type=application/pdf'
```
To use the limit the conversion to pages 1 to 5, use the start/stop parameters in the request URL: http://127.0.0.1:8503/predict/?start=1&stop=5

## Dataset
### Generate dataset

To generate a dataset you need 

1. A directory containing the PDFs
2. A directory containing the `.html` files (processed `.tex` files by [LaTeXML](https://math.nist.gov/~BMiller/LaTeXML/)) with the same folder structure
3. A binary file of [pdffigures2](https://github.com/allenai/pdffigures2) and a corresponding environment variable `export PDFFIGURES_PATH="/path/to/binary.jar"`

Next run

```
python -m nougat.dataset.split_htmls_to_pages --html path/html/root --pdfs path/pdf/root --out path/paired/output --figure path/pdffigures/outputs
```

Additional arguments include

| Argument              | Description                                |
| --------------------- | ------------------------------------------ |
| `--recompute`         | recompute all splits                       |
| `--markdown MARKDOWN` | Markdown output dir                        |
| `--workers WORKERS`   | How many processes to use                  |
| `--dpi DPI`           | What resolution the pages will be saved at |
| `--timeout TIMEOUT`   | max time per paper in seconds              |
| `--tesseract`         | Tesseract OCR prediction for each page     |

Finally create a `jsonl` file that contains all the image paths, markdown text and meta information.

```
python -m nougat.dataset.create_index --dir path/paired/output --out index.jsonl
```

For each `jsonl` file you also need to generate a seek map for faster data loading:

```
python -m nougat.dataset.gen_seek file.jsonl
```

The resulting directory structure can look as follows:

```
root/
├── images
├── train.jsonl
├── train.seek.map
├── test.jsonl
├── test.seek.map
├── validation.jsonl
└── validation.seek.map
```

Note that the `.mmd` and `.json` files in the `path/paired/output` (here `images`) are no longer required.
This can be useful for pushing to a S3 bucket by halving the amount of files.

## Training

To train or fine tune a Nougat model, run 

```
python train.py --config config/train_nougat.yaml
```

## Evaluation

Run 

```
python test.py --checkpoint path/to/checkpoint --dataset path/to/test.jsonl --save_path path/to/results.json
```

To get the results for the different text modalities, run

```
python -m nougat.metrics path/to/results.json
```

## FAQ

- Why am I only getting `[MISSING_PAGE]`?

  Nougat was trained on scientific papers found on arXiv and PMC. Is the document you're processing similar to that?
  What language is the document in? Nougat works best with English papers, other Latin-based languages might work. **Chinese, Russian, Japanese etc. will not work**.
  If these requirements are fulfilled it might be because of false positives in the failure detection, when computing on CPU or older GPUs ([#11](https://github.com/facebookresearch/nougat/issues/11)). Try passing the `--no-skipping` flag for now.

- Where can I download the model checkpoint from.

  They are uploaded here on GitHub in the release section. You can also download them during the first execution of the program. Choose the preferred preferred model by passing `--model 0.1.0-{base,small}`

## Citation

```
@misc{blecher2023nougat,
      title={Nougat: Neural Optical Understanding for Academic Documents}, 
      author={Lukas Blecher and Guillem Cucurull and Thomas Scialom and Robert Stojnic},
      year={2023},
      eprint={2308.13418},
      archivePrefix={arXiv},
      primaryClass={cs.LG}
}
```

## Acknowledgments

This repository builds on top of the [Donut](https://github.com/clovaai/donut/) repository.

## License

Nougat codebase is licensed under MIT.

Nougat model weights are licensed under CC-BY-NC.
